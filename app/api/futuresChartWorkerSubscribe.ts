import ChartWorker from './futuresChart.worker';
import SubminuteChartWorker from './futuresSubminuteChart.worker';
import {
  CandlestickChartInterval, ExtendedCandlestickChartInterval,
  FuturesChartCandle, FuturesExchangeInfo, WorkerCandlesMessageBack,
  WorkerInitMessage, WorkerSubscribeMessage, WorkerUnsubscribeMessage,
  SubminutedCandlestickChartInterval,
} from './types';
import options from './options';
import combineCandlesIfNeeded from './combineCandlesIfNeeded';
import { subminuteFuturesIntervals } from './futuresREST';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace globalThis {
    // eslint-disable-next-line no-var, vars-on-top
    var chartWorkers: Record<CandlestickChartInterval, Worker>;
  }
}

// store workers globally to re-use them at plugins
globalThis.chartWorkers = globalThis.chartWorkers ?? {} as typeof globalThis.chartWorkers;

const typedArrayToCandles = (
  float64: Float64Array,
  symbol: string,
  interval: ExtendedCandlestickChartInterval | CandlestickChartInterval,
) => {
  const candles: FuturesChartCandle[] = [];
  const FIELDS_LENGTH = 11; // 11 is number of candle fields

  for (let i = 0; i < float64.length / FIELDS_LENGTH; i += 1) {
    const time = float64[0 + i * FIELDS_LENGTH];
    const closeTime = float64[6 + i * FIELDS_LENGTH];
    const open = float64[1 + i * FIELDS_LENGTH];
    const close = float64[4 + i * FIELDS_LENGTH];

    candles.push({
      symbol,
      interval,
      direction: +open <= +close ? 'UP' : 'DOWN',
      timeISOString: new Date(time).toISOString(),
      closeTimeISOString: new Date(closeTime).toISOString(),
      time: float64[0 + i * FIELDS_LENGTH],
      open: float64[1 + i * FIELDS_LENGTH],
      high: float64[2 + i * FIELDS_LENGTH],
      low: float64[3 + i * FIELDS_LENGTH],
      close: float64[4 + i * FIELDS_LENGTH],
      volume: float64[5 + i * FIELDS_LENGTH],
      closeTime: float64[6 + i * FIELDS_LENGTH],
      quoteVolume: float64[7 + i * FIELDS_LENGTH],
      trades: float64[8 + i * FIELDS_LENGTH],
      takerBuyBaseVolume: float64[9 + i * FIELDS_LENGTH],
      takerBuyQuoteVolume: float64[10 + i * FIELDS_LENGTH],
    });
  }
  return candles;
};

const allCandles: Record<`${CandlestickChartInterval}${string}`, FuturesChartCandle[]> = {};

export default function futuresChartWorkerSubscribe({
  interval, symbols, callback, frequency, exchangeInfo,
}: {
  interval: CandlestickChartInterval | ExtendedCandlestickChartInterval;
  symbols: string[] | 'PERPETUAL';
  callback: (symbol: string, candles: FuturesChartCandle[]) => void;
  frequency: number;
  exchangeInfo: FuturesExchangeInfo,
}): () => void {
  const actualInterval = ({
    '2m': '1m', '10m': '5m', '2d': '1d', '4d': '1d', '2w': '1w', '2M': '1M',
  } as Record<ExtendedCandlestickChartInterval, CandlestickChartInterval>)[
    interval as ExtendedCandlestickChartInterval
  ] ?? interval as CandlestickChartInterval | SubminutedCandlestickChartInterval;
  // subscriptionId is used to make worker identify current subscription
  const subscriptionId = new Date().toISOString();

  // load all symbols
  const allSymbols = exchangeInfo.symbols
    .filter(({ contractType }) => contractType === 'PERPETUAL')
    .map(({ symbol }) => symbol);

  // if 'PERPETUAL' is given instead of symbol list then convert it to the list of PERPETUAL symbols
  const workerSymbols = symbols === 'PERPETUAL' ? allSymbols : symbols;
  let worker: ChartWorker | SubminuteChartWorker;

  // if no worker for given interval is created yet then create thw worker
  if (!globalThis.chartWorkers[actualInterval]) {
    worker = subminuteFuturesIntervals
      .includes(actualInterval as SubminutedCandlestickChartInterval)
      ? new SubminuteChartWorker() : new ChartWorker();
    const initMessage: WorkerInitMessage = {
      type: 'INIT', allSymbols, interval: actualInterval, isTestnet: options.isTestnet,
    };
    worker.postMessage(initMessage);
    globalThis.chartWorkers[actualInterval] = worker;
  } else {
    // else re-use previously created worker
    worker = globalThis.chartWorkers[actualInterval];
  }

  // start subscription
  const subscribeMessage: WorkerSubscribeMessage = {
    type: 'SUBSCRIBE', symbols: workerSymbols, frequency, subscriptionId,
  };

  const handler = ({ data }: MessageEvent< WorkerCandlesMessageBack>) => {
    // ignore other subscriptions
    if (data.subscriptionId !== subscriptionId) return;
    if (data.type === 'ALL_CANDLES') {
      const candles = typedArrayToCandles(data.candlesArray, data.symbol, interval);
      allCandles[`${actualInterval}${data.symbol}`] = candles;
      callback(data.symbol, combineCandlesIfNeeded(interval, candles));
    } if (data.type === 'NEW_CANDLE') {
      const [newCandle] = typedArrayToCandles(data.candlesArray, data.symbol, interval);
      const candles = allCandles[`${actualInterval}${data.symbol}`]?.concat(newCandle);
      if (!candles) return;
      allCandles[`${actualInterval}${data.symbol}`] = candles;
      callback(data.symbol, combineCandlesIfNeeded(interval, candles));
    } if (data.type === 'EXTEND_LAST_CANDLE') {
      const [lastCandle] = typedArrayToCandles(data.candlesArray, data.symbol, interval);
      const candles = allCandles[`${actualInterval}${data.symbol}`]?.slice();
      if (!candles) return;
      Object.assign(candles[candles.length - 1], lastCandle);
      allCandles[`${actualInterval}${data.symbol}`] = candles;
      callback(data.symbol, combineCandlesIfNeeded(interval, candles));
    }
  };

  worker.addEventListener('message', handler);

  worker.postMessage(subscribeMessage);

  return () => {
    const unsubscribeMessage: WorkerUnsubscribeMessage = {
      type: 'UNSUBSCRIBE', subscriptionId,
    };
    worker.postMessage(unsubscribeMessage);
    worker.removeEventListener('message', handler);
  };
}
