/* eslint-disable no-await-in-loop */
import 'regenerator-runtime';
import {
  SubminutedCandlestickChartInterval, FuturesChartCandle, WorkerCandlesMessageBack, FuturesAggTrade,
  WorkerSubscribeMessage, WorkerUnsubscribeMessage, WorkerInitMessage, FuturesAggTradeStreamTicker,
} from './types';
import { setOptions } from './options';
import futuresCandles from './futuresCandles';
import { futuresAggTradeStream } from './futuresStreams';
import { candlesToTypedArray } from './utils';

// eslint-disable-next-line no-restricted-globals
const ctx = self as unknown as Worker;

let allSymbols: string[];
let interval: SubminutedCandlestickChartInterval;

const allIntervalCandles: Record<string, FuturesChartCandle[]> = {};

const subscriptions: Record<string, {
  frequency: number;
  symbols: string[];
  lastMessageBackTimes: Record<string, number>;
}> = {};

const tick = (type: WorkerCandlesMessageBack['type'], subscriptionId: string, symbol: string) => {
  if (type !== 'ALL_CANDLES') subscriptions[subscriptionId].lastMessageBackTimes[symbol] = Date.now();
  let messageBack: WorkerCandlesMessageBack;
  if (type === 'ALL_CANDLES') {
    const candlesArray = candlesToTypedArray(allIntervalCandles[symbol]);
    messageBack = {
      type, subscriptionId, symbol, candlesArray, interval,
    };
  } else if (type === 'EXTEND_LAST_CANDLE' || type === 'NEW_CANDLE') {
    const candlesArray = candlesToTypedArray([
      allIntervalCandles[symbol][allIntervalCandles[symbol].length - 1],
    ]);
    messageBack = {
      type, subscriptionId, symbol, candlesArray, interval,
    };
  } else {
    throw new Error(`Unsupported message type ${type as string}`);
  }

  ctx.postMessage(messageBack, [messageBack.candlesArray.buffer]);
};

const getDivider = (subMinuteInterval: SubminutedCandlestickChartInterval) => ({
  '5s': 12,
  '10s': 6,
  '15s': 4,
  '20s': 3,
  '30s': 2,
}[subMinuteInterval]);

const convertOneMinuteToSubMinute = (
  candles: FuturesChartCandle[], subMinuteInterval: SubminutedCandlestickChartInterval,
): FuturesChartCandle[] => {
  let result: FuturesChartCandle[] = [];
  const divider = getDivider(subMinuteInterval);

  for (let i = 0; i < candles.length; i += 1) {
    result = result.concat(
      Array(divider).fill(candles[i])
        .map((candle: FuturesChartCandle, index): FuturesChartCandle => {
          const time = candle.time + index * (60_000 / divider);
          const closeTime = candle.closeTime - (divider - index) * (60_000 / divider);
          return {
            ...candle,
            time,
            timeISOString: new Date(time).toISOString(),
            closeTime,
            closeTimeISOString: new Date(closeTime).toISOString(),
            interval: subMinuteInterval,
          };
        }),
    );
  }

  const sliceIndex = result.findIndex(({ time }) => time > Date.now());

  return result.slice(0, sliceIndex).slice(-1500);
};

// eslint-disable-next-line @typescript-eslint/no-misused-promises
ctx.addEventListener('message', async ({ data }: MessageEvent<WorkerSubscribeMessage | WorkerInitMessage | WorkerUnsubscribeMessage>) => {
  if (data.type === 'INIT') {
    // initialise by starting WS subscription
    allSymbols = data.allSymbols;
    interval = data.interval as SubminutedCandlestickChartInterval;

    setOptions({ isTestnet: data.isTestnet });

    let lastTick: FuturesAggTradeStreamTicker;

    futuresAggTradeStream(allSymbols, (ticker) => {
      const { symbol } = ticker;
      const divider = getDivider(interval);
      const candles = allIntervalCandles[symbol];
      let type: WorkerCandlesMessageBack['type'];

      if (!candles) return;

      const lastCandle = candles[candles.length - 1];
      const price = +ticker.price;

      if (ticker.eventTime < lastCandle.closeTime) {
        if (lastCandle.low > price) lastCandle.low = price;
        else if (lastCandle.high < price) lastCandle.high = price;
        lastCandle.close = price;
        lastCandle.direction = candles[candles.length - 2].close > lastCandle.close ? 'DOWN' : 'UP';
        type = 'EXTEND_LAST_CANDLE';
      } else {
        const closeTime = lastCandle.closeTime + (60_000 / divider);
        const time = lastCandle.time + (60_000 / divider);
        if (lastTick?.eventTime < lastCandle.closeTime) {
          lastCandle.isFinal = true;
        }
        candles.push({
          symbol,
          interval,
          close: price,
          closeTime,
          high: price,
          low: price,
          open: price,
          quoteVolume: 0,
          takerBuyBaseVolume: 0,
          takerBuyQuoteVolume: 0,
          time,
          trades: 0,
          volume: 0,
          isFinal: false,
          direction: lastCandle.close > price ? 'DOWN' : 'UP',
          closeTimeISOString: new Date(closeTime).toISOString(),
          timeISOString: new Date(time).toISOString(),
          isFirstEver: false,
        });

        type = 'NEW_CANDLE';
      }

      lastTick = ticker;

      const subscriptionEntries = Object.entries(subscriptions);

      const now = Date.now();

      for (let i = 0; i < subscriptionEntries.length; i += 1) {
        const [subscriptionId, {
          frequency, symbols, lastMessageBackTimes,
        }] = subscriptionEntries[i];

        if (
          symbols.includes(symbol)
          && (
            !lastMessageBackTimes[symbol]
            || (frequency && lastMessageBackTimes[symbol] + frequency < now)
            || frequency === 0
            || type === 'NEW_CANDLE'
          )
        ) {
          tick(type, subscriptionId, symbol);
        }
      }
    });

    // start collecting data
    for (let i = 0; i < allSymbols.length; i += 1) {
      const symbol = allSymbols[i];

      if (!allIntervalCandles[symbol]) {
        const candles = await futuresCandles({
          symbol, interval: '1m', limit: 1000, lastCandleFromCache: true,
        });

        allIntervalCandles[symbol] = convertOneMinuteToSubMinute(candles, interval);

        await new Promise((r) => { setTimeout(r, 5000); }); // delay
      }
    }
  } else if (data.type === 'SUBSCRIBE') {
    const { symbols, subscriptionId, frequency } = data;

    subscriptions[subscriptionId] = {
      frequency,
      lastMessageBackTimes: {},
      symbols,
    };

    // collect requested symbols with no delay
    for (let i = 0; i < symbols.length; i += 1) {
      const symbol = symbols[i];
      if (!allIntervalCandles[symbol]) {
        void futuresCandles({
          symbol, interval: '1m', limit: 1000, lastCandleFromCache: true,
        // eslint-disable-next-line @typescript-eslint/no-loop-func
        }).then((candles) => {
          allIntervalCandles[symbol] = convertOneMinuteToSubMinute(candles, interval);
          // if not unsubscribed while request passed
          if (subscriptions[data.subscriptionId]) {
            tick('ALL_CANDLES', subscriptionId, symbol);
          }
        });
      } else {
        tick('ALL_CANDLES', subscriptionId, symbol);
      }
    }
  } else if (data.type === 'UNSUBSCRIBE') {
    delete subscriptions[data.subscriptionId];
  }
});

// export this pseudo class for typescript
export default class Work extends Worker { constructor() { super(''); } }
