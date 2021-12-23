import Worker, {
  CandlesMessageBack, InitMessage, SubscribeMessage, UnsubscribeMessage,
} from './futuresChart.worker';
import { CandlestickChartInterval, FuturesChartCandle } from './types';
import { futuresExchangeInfo } from './futuresREST';
import options from './options';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace globalThis {
    // eslint-disable-next-line no-var, vars-on-top
    var chartWorkers: Record<CandlestickChartInterval, Worker>;
    // eslint-disable-next-line vars-on-top, no-var
    var altamoonFuturesChartWorkerSubscribe: typeof futuresChartWorkerSubscribe;
  }
}

// store workers globally to re-use them at plugins
globalThis.chartWorkers = globalThis.chartWorkers ?? {} as typeof globalThis.chartWorkers;

export default function futuresChartWorkerSubscribe({
  interval, symbols, callback, frequency,
}: {
  interval: CandlestickChartInterval;
  symbols: string[] | 'PERPETUAL';
  callback: (symbol: string, candles: FuturesChartCandle[]) => void;
  frequency: number;
}): (() => void) {
  // the function should return unsubscribe handler
  let unsubscribe = () => {}; // no-op by default
  // load all symbols
  void futuresExchangeInfo().then((info) => {
    const allSymbols = info.symbols
      .filter(({ contractType }) => contractType === 'PERPETUAL')
      .map(({ symbol }) => symbol);

    // if 'PERPETUAL' is given instead of symbol list then convert it to the list of PERPETUAL symbols
    const workerSymbols = symbols === 'PERPETUAL' ? allSymbols : symbols;
    let worker: Worker;

    // if no worker for given interval is created yet then create thw worker
    if (!globalThis.chartWorkers[interval]) {
      worker = new Worker();
      const initMessage: InitMessage = {
        type: 'INIT', allSymbols, interval, isTestnet: options.isTestnet,
      };
      worker.postMessage(initMessage);
      globalThis.chartWorkers[interval] = worker;
    } else {
      // else re-use previously created worker
      worker = globalThis.chartWorkers[interval];
    }

    // subscriptionId is used to make worker identify current subscription
    const subscriptionId = new Date().toISOString();

    // start subscription
    const subscribeMessage: SubscribeMessage = {
      type: 'SUBSCRIBE', symbols: workerSymbols, frequency, subscriptionId,
    };
    worker.postMessage(subscribeMessage);

    const handler = ({ data }: MessageEvent<CandlesMessageBack>) => {
      // ignore other subscriptions
      if (data.subscriptionId !== subscriptionId) return;
      // decode candles from buffer
      const float64 = data.candlesArray;
      const candles: FuturesChartCandle[] = [];
      const FIELDS_LENGTH = 11; // 11 is number of candle fields

      for (let i = 0; i < float64.length / FIELDS_LENGTH; i += 1) {
        const time = float64[0 + i * FIELDS_LENGTH];
        const closeTime = float64[6 + i * FIELDS_LENGTH];
        const open = float64[1 + i * FIELDS_LENGTH];
        const close = float64[4 + i * FIELDS_LENGTH];

        candles.push({
          symbol: data.symbol,
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

      callback(data.symbol, candles);
    };

    worker.addEventListener('message', handler);

    unsubscribe = () => {
      const unsubscribeMessage: UnsubscribeMessage = {
        type: 'UNSUBSCRIBE', subscriptionId,
      };
      worker.postMessage(unsubscribeMessage);
      worker.removeEventListener('message', handler);
    };
  });

  return () => unsubscribe();
}

// workers don't work well when minicharts are used as part of Altamoon
// the widget is going to use the global altamoonFuturesChartWorkerSubscription
// but the standalone version is going to import the function as usually
window.altamoonFuturesChartWorkerSubscribe = futuresChartWorkerSubscribe;
