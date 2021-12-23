/* eslint-disable no-await-in-loop */
import 'regenerator-runtime';
import { CandlestickChartInterval, FuturesChartCandle } from './types';
import futuresCandles from './futuresCandles';
import { futuresCandlesSubscribe } from './futuresStreams';

// eslint-disable-next-line no-restricted-globals
const ctx = self as unknown as Worker;

export interface CandlesMessageBack {
  symbol: string;
  candlesArrayBuffer: ArrayBuffer;
  subscriptionId: string;
}

export interface SubscribeMessage {
  type: 'SUBSCRIBE';
  symbols: string[];
  frequency: number;
  subscriptionId: string;
}

export interface UnsubscribeMessage {
  type: 'UNSUBSCRIBE';
  subscriptionId: string;
}

export interface InitMessage {
  type: 'INIT';
  allSymbols: string[]
  interval: CandlestickChartInterval;
}

let allSymbols: string[];
let interval: CandlestickChartInterval;

const allIntervalCandles: Record<string, FuturesChartCandle[]> = {};

const subscriptions: Record<string, {
  frequency: number; symbols: string[]; lastMessageBackTime: number;
}> = {};

const getBuffer = (symbol: string) => {
  const candles = allIntervalCandles[symbol];
  const FIELDS_LENGTH = 11; // 11 is number of candle fields
  const float64 = new Float64Array(FIELDS_LENGTH * candles.length);

  for (let i = 0; i < candles.length; i += 1) {
    const {
      time, open, high, low, close, volume, closeTime, quoteVolume,
      trades, takerBuyBaseVolume, takerBuyQuoteVolume,
    } = candles[i];

    float64[0 + FIELDS_LENGTH * i] = time;
    float64[1 + FIELDS_LENGTH * i] = open;
    float64[2 + FIELDS_LENGTH * i] = high;
    float64[3 + FIELDS_LENGTH * i] = low;
    float64[4 + FIELDS_LENGTH * i] = close;
    float64[5 + FIELDS_LENGTH * i] = volume;
    float64[6 + FIELDS_LENGTH * i] = closeTime;
    float64[7 + FIELDS_LENGTH * i] = quoteVolume;
    float64[8 + FIELDS_LENGTH * i] = trades;
    float64[9 + FIELDS_LENGTH * i] = takerBuyBaseVolume;
    float64[10 + FIELDS_LENGTH * i] = takerBuyQuoteVolume;
  }

  return float64.buffer;
};

const tick = (subscriptionId: string, symbol: string) => {
  subscriptions[subscriptionId].lastMessageBackTime = Date.now();
  const candlesArrayBuffer = getBuffer(symbol);
  const messgeBack: CandlesMessageBack = {
    subscriptionId, symbol, candlesArrayBuffer,
  };

  ctx.postMessage(messgeBack, [candlesArrayBuffer]);
};

// eslint-disable-next-line @typescript-eslint/no-misused-promises
ctx.addEventListener('message', async ({ data }: MessageEvent<SubscribeMessage | InitMessage | UnsubscribeMessage>) => {
  if (data.type === 'INIT') {
    // initialise by starting WS subscription
    allSymbols = data.allSymbols;
    interval = data.interval;

    const subscriptionPairs = allSymbols.map(
      (symbol) => [symbol, interval] as [string, CandlestickChartInterval],
    );

    futuresCandlesSubscribe(subscriptionPairs, (candle) => {
      const { symbol } = candle;
      const candles = allIntervalCandles[symbol];
      if (!candles) return;
      const now = Date.now();

      if (candle.time === candles[candles.length - 1]?.time) {
        Object.assign(candles[candles.length - 1], candle);
      } else {
        candles.push(candle);
      }
      const subscriptionEntries = Object.entries(subscriptions);

      for (let i = 0; i < subscriptionEntries.length; i += 1) {
        const [subscriptionId, {
          frequency, symbols, lastMessageBackTime,
        }] = subscriptionEntries[i];
        if (
          symbols.includes(symbol)
          && (
            (frequency && lastMessageBackTime + frequency < now)
            || frequency === 0
          )
        ) {
          tick(subscriptionId, symbol);
        }
      }
    });

    // start collecting data
    for (let i = 0; i < allSymbols.length; i += 1) {
      const symbol = allSymbols[i];
      if (!allIntervalCandles[symbol]) {
        allIntervalCandles[symbol] = await futuresCandles({
          symbol, interval, limit: 1000, lastCandleFromCache: true,
        });

        await new Promise((r) => { setTimeout(r, 5000); }); // delay
      }
    }
  } else if (data.type === 'SUBSCRIBE') {
    const { symbols, subscriptionId, frequency } = data;

    subscriptions[subscriptionId] = {
      frequency,
      lastMessageBackTime: Date.now(),
      symbols,
    };

    // collect requested symbols with no delay
    for (let i = 0; i < symbols.length; i += 1) {
      const symbol = symbols[i];
      if (!allIntervalCandles[symbol]) {
        void futuresCandles({
          symbol, interval, limit: 1000, lastCandleFromCache: true,
        }).then((candles) => {
          allIntervalCandles[symbol] = candles;
        });
      } else {
        tick(subscriptionId, symbol);
      }
    }
  } else if (data.type === 'UNSUBSCRIBE') {
    delete subscriptions[data.subscriptionId];
  }
});

// export this pseudo class for typescript
export default class Work extends Worker { constructor() { super(''); } }
