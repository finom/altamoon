import { CandlestickChartInterval, FuturesChartCandle } from './types';
import { futuresExchangeInfo } from './futuresREST';
import { futuresCandlesSubscribe } from './futuresStreams';
import futuresCandles from './futuresCandles';

type Callback = (symbol: string, candles: FuturesChartCandle[]) => void;
type Unsubscribe = () => void;

const callbacks = {} as Record<CandlestickChartInterval, {
  symbol: string | null; callback: Callback
}[]>;
const subscriptions = {} as Record<CandlestickChartInterval, Unsubscribe>;
const allCandles = {} as Record<CandlestickChartInterval, Record<string, FuturesChartCandle[]>>;

export default function futuresChartSingleSubscription({
  interval, symbol: givenSymbol = null, callback: givenCallback,
}: {
  interval: CandlestickChartInterval,
  symbol?: string | null,
  callback: Callback,
}): Unsubscribe {
  const unsubscribe: Unsubscribe = () => {
    callbacks[interval] = callbacks[interval]
      .filter(({ callback }) => givenCallback !== callback);
  };

  // add handler
  callbacks[interval] = callbacks[interval] || [];
  callbacks[interval].push({ callback: givenCallback, symbol: givenSymbol });

  console.log('callbacks[interval] ', callbacks[interval].length);

  // retrieve all symbols
  void futuresExchangeInfo().then(({ symbols }) => {
    // if subscription exists
    if (subscriptions[interval]) {
      // call the callback if the subscription already made a tick
      if (allCandles[interval]) {
        for (const { symbol } of symbols) {
          if (allCandles[interval]?.[symbol]) {
            if (!givenSymbol || givenSymbol === symbol) {
              givenCallback(symbol, allCandles[interval][symbol])
            }
          }
        }
      }

      return;
    }

    for (const { symbol } of symbols) {
      void futuresCandles({
        symbol, interval, limit: 1000,
      }).then((candles) => {
        allCandles[interval] = allCandles[interval] || {};
        allCandles[interval][symbol] = candles;
        if (!givenSymbol || givenSymbol === symbol) {
          callbacks[interval].forEach((c) => c(symbol, allCandles[interval][symbol]));
        }
      });
    }

    const subscriptionPairs = symbols.map(
      ({ symbol }) => [symbol, interval] as [string, CandlestickChartInterval],
    );

    futuresCandlesSubscribe(subscriptionPairs, (candle) => {
      const { symbol } = candle;
      const candles = allCandles[interval]?.[symbol];
      if (!candles) return;

      if (candle.time === candles[candles.length - 1].time) {
        Object.assign(candles[candles.length - 1], candle);
      } else {
        candles.push(candle);
      }

      if (!givenSymbol || givenSymbol === symbol) {
        callbacks[interval].forEach((c) => c(symbol, [...candles]));
      }
    });
  });

  return unsubscribe;
}
