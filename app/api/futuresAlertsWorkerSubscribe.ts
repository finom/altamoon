import Worker, {
  Alert, AlertMessageBack, InitMessage, SetAlertsMessage,
} from './futuresAlerts.worker';
import { FuturesExchangeInfo } from './types';
import options from './options';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace globalThis {
    // eslint-disable-next-line no-var, vars-on-top
    var alertsWorker: Worker;
  }
}

// store workers globally to re-use them at plugins
globalThis.alertsWorker = globalThis.alertsWorker ?? undefined as typeof globalThis.alertsWorker;

export default function futuresAlertsWorkerSubscribe({
  callback, exchangeInfo,
}: {
  callback: (message: AlertMessageBack) => void;
  exchangeInfo: FuturesExchangeInfo,
}): (d: Alert[]) => void {
  // load all symbols
  const allSymbols = exchangeInfo.symbols
    .filter(({ contractType }) => contractType === 'PERPETUAL')
    .map(({ symbol }) => symbol);
  let worker: Worker;

  // if no worker is created yet then create it
  if (!globalThis.alertsWorker) {
    worker = new Worker();
    const initMessage: InitMessage = {
      type: 'INIT', allSymbols, isTestnet: options.isTestnet,
    };
    worker.postMessage(initMessage);
    globalThis.alertsWorker = worker;
  } else {
    // else re-use previously created worker
    worker = globalThis.alertsWorker;
  }

  const handler = ({ data }: MessageEvent< AlertMessageBack>) => {
    if (data.type === 'ALERT_UP' || data.type === 'ALERT_DOWN') {
      callback?.(data);
    }
  };

  worker.addEventListener('message', handler);

  return (alerts: Alert[]) => {
    const setAlertsMessage: SetAlertsMessage = {
      type: 'SET_ALERTS',
      alerts,
    };

    worker.postMessage(setAlertsMessage);
  };
}
