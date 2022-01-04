import Worker, {
  Alert,
  AlertMessageBack,
  CandlesMessageBack, InitMessage, SetAlertsMessage, SubscribeMessage, UnsubscribeMessage,
} from './futuresChart.worker';
import { CandlestickChartInterval, FuturesChartCandle, FuturesExchangeInfo } from './types';
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

const typedArrayToCandles = (
  float64: Float64Array, symbol: string, interval: CandlestickChartInterval,
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
  interval, symbols, callback, frequency, alertCallback, exchangeInfo,
}: {
  interval: CandlestickChartInterval;
  symbols: string[] | 'PERPETUAL';
  callback: (symbol: string, candles: FuturesChartCandle[]) => void;
  frequency: number;
  alertCallback?: (message: AlertMessageBack) => void;
  exchangeInfo: FuturesExchangeInfo,
}): { unsubscribe: () => void, setAlerts: (d: Alert[]) => void } {
  // subscriptionId is used to make worker identify current subscription
  const subscriptionId = new Date().toISOString();

  // load all symbols
  const allSymbols = exchangeInfo.symbols
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

  // start subscription
  const subscribeMessage: SubscribeMessage = {
    type: 'SUBSCRIBE', symbols: workerSymbols, frequency, subscriptionId,
  };
  worker.postMessage(subscribeMessage);

  const handler = ({ data }: MessageEvent<CandlesMessageBack | AlertMessageBack>) => {
    // ignore other subscriptions
    if (data.subscriptionId !== subscriptionId) return;
    if (data.type === 'ALL_CANDLES') {
      const candles = typedArrayToCandles(data.candlesArray, data.symbol, interval);
      allCandles[`${interval}${data.symbol}`] = candles;
      callback(data.symbol, candles);
    } if (data.type === 'NEW_CANDLE') {
      const [newCandle] = typedArrayToCandles(data.candlesArray, data.symbol, interval);
      const candles = allCandles[`${interval}${data.symbol}`].concat(newCandle);
      allCandles[`${interval}${data.symbol}`] = candles;
      callback(data.symbol, candles);
    } if (data.type === 'EXTEND_LAST_CANDLE') {
      const [lastCandle] = typedArrayToCandles(data.candlesArray, data.symbol, interval);
      const candles = allCandles[`${interval}${data.symbol}`].slice();
      Object.assign(candles[candles.length - 1], lastCandle);
      allCandles[`${interval}${data.symbol}`] = candles;
      callback(data.symbol, candles);
    } else if (data.type === 'ALERT') {
      alertCallback?.(data);
    }
  };

  worker.addEventListener('message', handler);

  return {
    unsubscribe: () => {
      const unsubscribeMessage: UnsubscribeMessage = {
        type: 'UNSUBSCRIBE', subscriptionId,
      };
      worker.postMessage(unsubscribeMessage);
      worker.removeEventListener('message', handler);
    },
    setAlerts: (alerts: Alert[]) => {
      const setAlertsMessage: SetAlertsMessage = {
        type: 'SET_ALERTS',
        alerts,
        subscriptionId,
      };

      worker.postMessage(setAlertsMessage);
    },
  };
}

// workers don't work well when minicharts are used as part of Altamoon
// the widget is going to use the global altamoonFuturesChartWorkerSubscription
// but the standalone version is going to import the function as usually
window.altamoonFuturesChartWorkerSubscribe = futuresChartWorkerSubscribe;
