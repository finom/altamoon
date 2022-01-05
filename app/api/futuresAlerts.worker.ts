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
export interface AlertMessageBack {
  type: 'ALERT_UP' | 'ALERT_DOWN';
  symbol: string;
  price: number;
  lastPrice: number;
}

export interface SetAlertsMessage {
  type: 'SET_ALERTS';
  alerts: Alert[];
}

export interface InitMessage {
  type: 'INIT';
  allSymbols: string[]
  isTestnet?: boolean;
}

let allSymbols: string[];
const interval: CandlestickChartInterval = '1m';

const allIntervalCandles: Record<string, FuturesChartCandle[]> = {};

let alerts: Alert[];

const lastPrices: Record<string, number> = {};

const checkAlerts = (symbol: string, lastPrice: number) => {
  const prevPrice = lastPrices[symbol];
  const newAlerts: Alert[] = [];
  lastPrices[symbol] = lastPrice;
  if (!prevPrice || !alerts?.length) return;

  for (let i = 0; i < alerts.length; i += 1) {
    const { price, symbol: alertSymbol } = alerts[i];
    // eslint-disable-next-line no-continue
    if (alertSymbol !== symbol) continue;
    let alertMessage: AlertMessageBack | null = null;
    if (lastPrice >= price && prevPrice < price) {
      alertMessage = {
        type: 'ALERT_UP',
        symbol,
        price,
        lastPrice,
      };
    } else if (lastPrice <= price && prevPrice > price) {
      alertMessage = {
        type: 'ALERT_DOWN',
        symbol,
        price,
        lastPrice,
      };
    } else {
      newAlerts.push(alerts[i]);
    }

    if (alertMessage) {
      ctx.postMessage(alertMessage);
    }
  }
};

// eslint-disable-next-line @typescript-eslint/no-misused-promises
ctx.addEventListener('message', async ({ data }: MessageEvent<InitMessage | SetAlertsMessage>) => {
  if (data.type === 'INIT') {
    // initialise by starting WS subscription
    allSymbols = data.allSymbols;

    setOptions({ isTestnet: data.isTestnet });

    const subscriptionPairs = allSymbols.map(
      (symbol) => [symbol, interval] as [string, CandlestickChartInterval],
    );

    futuresCandlesSubscribe(subscriptionPairs, (candle) => {
      checkAlerts(candle.symbol, candle.close);
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
  } else if (data.type === 'SET_ALERTS') {
    alerts = data.alerts;
  }
});

// export this pseudo class for typescript
export default class Work extends Worker { constructor() { super(''); } }
