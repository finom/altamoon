import { CandlestickChartInterval, FuturesChartCandle } from './types';
import { futuresExchangeInfo } from './futuresREST';
import futuresCandles from './futuresCandles';
import { futuresCandlesSubscribe } from './futuresStreams';
import './global-types';

type Callback = (symbol: string, candles: FuturesChartCandle[]) => void;
type Unsubscribe = () => void;

// define those variables globally so they can be used by plugins
globalThis.singleSubscriptionCallbacks = globalThis.singleSubscriptionCallbacks
  ?? {} as typeof globalThis.singleSubscriptionCallbacks;
globalThis.singleSubscriptionTo = globalThis.singleSubscriptionTo
  ?? {} as typeof globalThis.singleSubscriptionTo;
globalThis.singleSubscriptionAllCandles = globalThis.singleSubscriptionAllCandles
  ?? {} as typeof globalThis.singleSubscriptionAllCandles;

export default function futuresChartSingleSubscription({
  interval, symbol: givenSymbol = null, isSequential, callback: givenCallback,
}: {
  interval: CandlestickChartInterval,
  symbol?: string | null,
  isSequential?: boolean;
  callback: Callback,
}): Unsubscribe {
  const callbacks = globalThis.singleSubscriptionCallbacks;
  const subscribedTo = globalThis.singleSubscriptionTo;
  const allCandles = globalThis.singleSubscriptionAllCandles;

  const unsubscribe: Unsubscribe = () => {
    callbacks[interval] = callbacks[interval]
      .filter(({ callback }) => givenCallback !== callback);
  };

  // add handler
  callbacks[interval] = callbacks[interval] || [];
  callbacks[interval].push({ callback: givenCallback, symbol: givenSymbol });

  void futuresExchangeInfo().then(({ symbols }) => {
    const loadCandles = (symbol: string) => futuresCandles({
      symbol, interval, limit: 1000,
    }).then((candles) => {
      allCandles[interval] = allCandles[interval] || {};
      allCandles[interval][symbol] = candles;
      callbacks[interval].forEach((c) => {
        if (!c.symbol || c.symbol === symbol) {
          c.callback(symbol, allCandles[interval][symbol]);
        }
      });
    });
    // retrieve all symbols
    // if subscription exists
    if (subscribedTo[interval]) {
    // call the callback if the subscription already made a tick
      if (allCandles[interval]) {
        for (const { symbol } of symbols) {
          if (allCandles[interval]?.[symbol]) {
            if (!givenSymbol || givenSymbol === symbol) {
              givenCallback(symbol, allCandles[interval][symbol]);
            }
          } else if (givenSymbol === symbol && isSequential) {
            void loadCandles(givenSymbol);
          }
        }
      }

      return;
    }

    subscribedTo[interval] = true;

    let symbolList = symbols.map(({ symbol }) => symbol);

    const loadAllCandles = async () => {
      // then load rest
      for (const symbol of symbolList) {
        if (isSequential && !allCandles[interval][symbol]) {
          // eslint-disable-next-line no-await-in-loop
          await loadCandles(symbol);
          // eslint-disable-next-line no-await-in-loop
          await new Promise((r) => { setTimeout(r, 5000); }); // a small delay
        } else {
          void loadCandles(symbol);
        }
      }
    };

    // load candles for givenSymbol first
    if (givenSymbol) {
      void loadCandles(givenSymbol).then(() => {
        // then load rest
        symbolList = symbolList.filter((symbol) => symbol !== givenSymbol);
        void loadAllCandles();
      });
    } else {
      void loadAllCandles();
    }

    const subscriptionPairs = symbols.map(
      ({ symbol }) => [symbol, interval] as [string, CandlestickChartInterval],
    );

    futuresCandlesSubscribe(subscriptionPairs, (candle) => {
      const { symbol } = candle;
      const candles = allCandles[interval]?.[symbol];
      if (!candles) return;

      if (candle.time === candles[candles.length - 1]?.time) {
        Object.assign(candles[candles.length - 1], candle);
      } else {
        candles.push(candle);
      }

      callbacks[interval].forEach((c) => {
        if (!c.symbol || c.symbol === symbol) {
          c.callback(symbol, allCandles[interval][symbol].slice());
        }
      });
    });
  });

  return unsubscribe;
}
