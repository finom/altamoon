/* eslint-disable no-await-in-loop */
import 'regenerator-runtime';
import { CandlestickChartInterval, FuturesChartCandle } from './types';
import futuresCandles from './futuresCandles';
import { futuresCandlesSubscribe } from './futuresStreams';
import { setOptions } from './options';

// eslint-disable-next-line no-restricted-globals
const ctx = self as unknown as Worker;

export interface Alert {
  symbol: string;
  price: number;
}

export interface CandlesMessageBack {
  type: 'CANDLES';
  subscriptionId: string;
  symbol: string;
  candlesArray: Float64Array;
  interval: CandlestickChartInterval;
}

export interface AlertMessageBack {
  type: 'ALERT';
  subscriptionId: string;
  symbol: string;
  price: number;
  lastPrice: number;
  direction: 'UP' | 'DOWN';
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

export interface SetAlertsMessage {
  type: 'SET_ALERTS';
  subscriptionId: string;
  alerts: Alert[];
}

export interface InitMessage {
  type: 'INIT';
  allSymbols: string[]
  interval: CandlestickChartInterval;
  isTestnet?: boolean;
}

let allSymbols: string[];
let interval: CandlestickChartInterval;

const allIntervalCandles: Record<string, FuturesChartCandle[]> = {};

const subscriptions: Record<string, {
  frequency: number;
  symbols: string[];
  lastMessageBackTime: number;
  alerts: Alert[];
  lastPrices: Record<string, number>;
}> = {};

const getTypedArray = (symbol: string) => {
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

  return float64;
};

const tick = (subscriptionId: string, symbol: string) => {
  subscriptions[subscriptionId].lastMessageBackTime = Date.now();
  const candlesArray = getTypedArray(symbol);
  const messgeBack: CandlesMessageBack = {
    type: 'CANDLES', subscriptionId, symbol, candlesArray, interval,
  };

  ctx.postMessage(messgeBack, [candlesArray.buffer]);
};

const checkAlerts = (subscriptionId: string, symbol: string, lastPrice: number) => {
  const prevPrice = subscriptions[subscriptionId].lastPrices[symbol];
  const { alerts } = subscriptions[subscriptionId];
  const newAlerts: Alert[] = [];
  subscriptions[subscriptionId].lastPrices[symbol] = lastPrice;
  if (!prevPrice || !alerts?.length) return;

  for (let i = 0; i < alerts.length; i += 1) {
    const { price, symbol: alertSymbol } = alerts[i];
    if (alertSymbol !== symbol) return;
    let alertMessage: AlertMessageBack | null = null;
    if (lastPrice >= price && prevPrice < price) {
      alertMessage = {
        type: 'ALERT',
        subscriptionId,
        symbol,
        price,
        lastPrice,
        direction: 'UP',
      };
    } else if (lastPrice <= price && prevPrice > price) {
      alertMessage = {
        type: 'ALERT',
        subscriptionId,
        symbol,
        price,
        lastPrice,
        direction: 'DOWN',
      };
    } else {
      newAlerts.push(alerts[i]);
    }

    subscriptions[subscriptionId].alerts = newAlerts;

    if (alertMessage) {
      ctx.postMessage(alertMessage);
    }
  }
};

// eslint-disable-next-line @typescript-eslint/no-misused-promises
ctx.addEventListener('message', async ({ data }: MessageEvent<SubscribeMessage | InitMessage | UnsubscribeMessage | SetAlertsMessage>) => {
  if (data.type === 'INIT') {
    // initialise by starting WS subscription
    allSymbols = data.allSymbols;
    interval = data.interval;

    setOptions({ isTestnet: data.isTestnet });

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

        checkAlerts(subscriptionId, symbol, candle.close);

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
      alerts: [],
      lastPrices: {},
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
  } else if (data.type === 'SET_ALERTS') {
    const { subscriptionId } = data;
    subscriptions[subscriptionId].alerts = data.alerts;
  }
});

// export this pseudo class for typescript
export default class Work extends Worker { constructor() { super(''); } }
