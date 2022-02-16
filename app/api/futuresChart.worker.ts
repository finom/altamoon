/* eslint-disable no-await-in-loop */
import 'regenerator-runtime';
import {
  CandlestickChartInterval, FuturesChartCandle, WorkerCandlesMessageBack,
  WorkerSubscribeMessage, WorkerUnsubscribeMessage, WorkerInitMessage,
} from './types';
import futuresCandles from './futuresCandles';
import { futuresCandlesSubscribe } from './futuresStreams';
import { setOptions } from './options';
import { candlesToTypedArray } from './utils';

// eslint-disable-next-line no-restricted-globals
const ctx = self as unknown as Worker;

let allSymbols: string[];
let interval: CandlestickChartInterval;

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

// eslint-disable-next-line @typescript-eslint/no-misused-promises
ctx.addEventListener('message', async ({ data }: MessageEvent<WorkerSubscribeMessage | WorkerInitMessage | WorkerUnsubscribeMessage>) => {
  if (data.type === 'INIT') {
    // initialise by starting WS subscription
    allSymbols = data.allSymbols;
    interval = data.interval as CandlestickChartInterval;

    setOptions({ isTestnet: data.isTestnet });

    const subscriptionPairs = allSymbols.map(
      (symbol) => [symbol, interval] as [string, CandlestickChartInterval],
    );

    futuresCandlesSubscribe(subscriptionPairs, (candle) => {
      const { symbol } = candle;
      const candles = allIntervalCandles[symbol];
      if (!candles) return;
      const now = Date.now();
      let type: WorkerCandlesMessageBack['type'];

      if (candle.time === candles[candles.length - 1]?.time) {
        Object.assign(candles[candles.length - 1], candle);
        type = 'EXTEND_LAST_CANDLE';
      } else {
        candles.push(candle);
        type = 'NEW_CANDLE';
      }

      const subscriptionEntries = Object.entries(subscriptions);

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
      lastMessageBackTimes: {},
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
