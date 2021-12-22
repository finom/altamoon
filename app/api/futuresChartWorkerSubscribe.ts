import Worker, {
  CandlesMessageBack, InitMessage, SubscribeMessage, UnsubscribeMessage,
} from './futuresChart.worker';
import { CandlestickChartInterval, FuturesChartCandle } from './types';
import { futuresExchangeInfo } from './futuresREST';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace globalThis {
    // eslint-disable-next-line no-var, vars-on-top
    var chartWorkers: Record<CandlestickChartInterval, Worker>;
    // eslint-disable-next-line vars-on-top, no-var
    var altamoonFuturesChartWorkerSubscription: typeof futuresChartWorkerSubscription;
  }
}

// store workers globally to re-use them at plugins
globalThis.chartWorkers = globalThis.chartWorkers ?? {} as typeof globalThis.chartWorkers;

export default function futuresChartWorkerSubscription({
  interval, symbols, callback, delay,
}: {
  interval: CandlestickChartInterval;
  symbols: string[] | 'PERPETUAL';
  callback: (symbol: string, candles: FuturesChartCandle[]) => void;
  delay: number;
}): (() => void) {
  // the function should return unsubscribe handler
  let unsubscribe = () => {}; // no-op by default
  // load all symbols
  void futuresExchangeInfo().then((info) => {
    // BNTUSDT is an unknown symbol, TODO remove this filter once futuresExchangeInfo doesn't return it
    const allSymbols = info.symbols.map(({ symbol }) => symbol).filter((symbol) => symbol !== 'BNTUSDT');
    // if 'PERPETUAL' is given instead of symbol list then convert it to the list of PERPETUAL symbols
    const workerSymbols = symbols === 'PERPETUAL'
      ? info.symbols.filter(({ contractType }) => contractType === 'PERPETUAL').map(({ symbol }) => symbol)
      : symbols;
    let worker: Worker;

    // if no worker for given interval is created yet then create thw worker
    if (!globalThis.chartWorkers[interval]) {
      worker = new Worker();
      const initMessage: InitMessage = { type: 'INIT', allSymbols, interval };
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
      type: 'SUBSCRIBE', symbols: workerSymbols, delay, subscriptionId,
    };
    worker.postMessage(subscribeMessage);

    const handler = ({ data }: MessageEvent<CandlesMessageBack>) => {
      // ignore other subscriptions
      if (data.subscriptionId !== subscriptionId) return;
      // decode JSON from buffer
      const decoder = new TextDecoder('utf-8');
      const array = new Uint8Array(data.candlesArrayBuffer);
      callback(
        data.symbol,
        JSON.parse(decoder.decode(array)) as FuturesChartCandle[],
      );
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
window.altamoonFuturesChartWorkerSubscription = futuresChartWorkerSubscription;
