/* eslint-disable @typescript-eslint/no-explicit-any */
import futuresSubscribe from './futuresSubscribe';
import futuresCandles from './futuresCandles';
import {
  FuturesAggTradeStreamTicker, CandlestickChartInterval,
  FuturesChartCandle, FuturesMiniTicker, FuturesTicker, FuturesMarkPriceTicker,
} from './types';

const isArrayUnique = (array: unknown[]) => new Set(array).size === array.length;

/**
 * The Aggregate Trade Streams push market trade information that is aggregated for a single taker order every 100 milliseconds.
 * @param symbols - A symbol or an array of symbols
 * @param callback - Stream callback
 * @returns
 */
export function futuresAggTradeStream(
  givenSymbols: string | string[], callback: (ticker: FuturesAggTradeStreamTicker) => any,
): () => void {
  const symbols = typeof givenSymbols === 'string' ? [givenSymbols] : givenSymbols;
  if (!isArrayUnique(symbols)) throw Error('futuresAggTradeStream: "symbols" cannot contain duplicate elements.');

  const streams = symbols.map((symbol) => `${symbol.toLowerCase()}@aggTrade`);

  return futuresSubscribe(streams, (ticker: Record<string, string | number>) => {
    const {
      e: eventType, E: eventTime, s: symbol, a: aggTradeId, p: price,
      q: amount, f: firstTradeId, l: lastTradeId, T: timestamp, m: maker,
    } = ticker;

    callback({
      eventType,
      eventTime,
      symbol,
      aggTradeId,
      price,
      amount,
      total: +price * +amount,
      firstTradeId,
      lastTradeId,
      timestamp,
      maker,
    } as unknown as FuturesAggTradeStreamTicker);
  });
}

type MiniTickerCallback<T> = (ticker: T) => any;

/**
 * 24hr rolling window mini-ticker statistics for a single symbol or for all symbols.
 * @param callback - Stream callback
 */
export function futuresMiniTickerStream(
  callback: MiniTickerCallback<FuturesMiniTicker[]>
): () => void;
export function futuresMiniTickerStream(
  symbol: string,
  callback: MiniTickerCallback<FuturesMiniTicker>
): () => void;
export function futuresMiniTickerStream(
  symbolOrCallback: string | MiniTickerCallback<FuturesMiniTicker[]>,
  callback?: MiniTickerCallback<FuturesMiniTicker>,
): () => void {
  type MiniTicker = {
    e: '24hrMiniTicker', // Event type
    E: number, // Event time
    s: string; // Symbol
    c: string; // Close price
    o: string; // Open price
    h: string; // High price
    l: string; // Low price
    v: string; // Total traded base asset volume
    q: string; // Total traded quote asset volume
  };

  const convert = (ticker: MiniTicker) => {
    const {
      E: time,
      s: symbol,
      c: close,
      o: open,
      h: high,
      l: low,
      v: volume,
      q: quoteVolume,
    } = ticker;

    return {
      time, symbol, close, open, high, low, volume, quoteVolume,
    };
  };

  const streams = typeof callback === 'undefined'
    ? ['!miniTicker@arr']
    : [`${(symbolOrCallback as string).toLowerCase()}@miniTicker`];

  return futuresSubscribe<MiniTicker | MiniTicker[]>(
    streams,
    (ticker) => {
      if (typeof callback === 'undefined') {
        (symbolOrCallback as MiniTickerCallback<FuturesMiniTicker[]>)(
          (ticker as MiniTicker[]).map(convert),
        );
      } else {
        callback(convert(ticker as MiniTicker));
      }
    },
  );
}

type TickerCallback<T> = (ticker: T) => any;

/**
 * 24hr rollwing window ticker statistics for a single symbol or all symbols.
 * @param callback - Stream callback
 */
export function futuresTickerStream(
  callback: TickerCallback<FuturesTicker[]>
): () => void;
export function futuresTickerStream(
  symbol: string,
  callback: TickerCallback<FuturesTicker>
): () => void;
export function futuresTickerStream(
  symbolOrCallback: string | TickerCallback<FuturesTicker[]>,
  callback?: TickerCallback<FuturesTicker>,
): () => void {
  type Ticker = {
    e: '24hrTicker', // Event type
    E: number; // Event time
    s: string; // Symbol
    p: string; // Price change
    P: string; // Price change percent
    w: string; // Weighted average price
    c: string; // Last price
    Q: string; // Last quantity
    o: string; // Open price
    h: string; // High price
    l: string; // Low price
    v: string; // Total traded base asset volume
    q: string; // Total traded quote asset volume
    O: number; // Statistics open time
    C: number; // Statistics close time
    F: number; // First trade ID
    L: number; // Last trade Id
    n: number; // Total number of trades
  };

  const convert = (ticker: Ticker) => {
    const {
      E: time,
      s: symbol,
      p: priceChange,
      P: priceChangePercent,
      w: averagePrice,
      c: close,
      Q: lastQuantity,
      o: open,
      h: high,
      l: low,
      v: volume,
      q: quoteVolume,
      O: openTime,
      C: closeTime,
      F: firstTradeId,
      L: lastTradeId,
      n: numberOfTrades,
    } = ticker;

    return {
      time,
      symbol,
      priceChange,
      priceChangePercent,
      averagePrice,
      close,
      lastQuantity,
      open,
      high,
      low,
      volume,
      quoteVolume,
      openTime,
      closeTime,
      firstTradeId,
      lastTradeId,
      numberOfTrades,
    };
  };

  const streams = typeof callback === 'undefined'
    ? ['!ticker@arr']
    : [`${(symbolOrCallback as string).toLowerCase()}@ticker`];

  return futuresSubscribe<Ticker | Ticker[]>(
    streams,
    (ticker) => {
      if (typeof callback === 'undefined') {
        (symbolOrCallback as TickerCallback<FuturesTicker[]>)(
          (ticker as Ticker[]).map(convert),
        );
      } else {
        callback(convert(ticker as Ticker));
      }
    },
  );
}

type MarkPriceCallback<T> = (ticker: T) => any;
/**
 * Mark price and funding rate for a single symbol or all symbols pushed every every second.
 * @param callback - Stream callback
 */
export function futuresMarkPriceStream(
  callback: MarkPriceCallback<FuturesMarkPriceTicker[]>
): () => void;
export function futuresMarkPriceStream(
  symbol: string,
  callback: MarkPriceCallback<FuturesMarkPriceTicker>
): () => void;
export function futuresMarkPriceStream(
  symbolOrCallback: string | MarkPriceCallback<FuturesMarkPriceTicker[]>,
  callback?: MarkPriceCallback<FuturesMarkPriceTicker>,
): () => void {
  type Ticker = {
    e: 'markPriceUpdate'; // Event type
    E: number; // Event time
    s: string; // Symbol
    p: string; // Mark price
    i: string; // Index price
    P: string; // Estimated Settle Price, only useful in the last hour before the settlement starts
    r: string; // Funding rate
    T: number; // Next funding time
  };

  const convert = (ticker: Ticker) => {
    const {
      e: eventType,
      E: eventTime,
      s: symbol,
      p: markPrice,
      i: indexPrice,
      r: fundingRate,
      T: fundingTime,
    } = ticker;

    return {
      eventType,
      eventTime,
      symbol,
      markPrice,
      indexPrice,
      fundingRate,
      fundingTime,
    };
  };

  const streams = typeof callback === 'undefined'
    ? ['!markPrice@arr@1s']
    : [`${(symbolOrCallback as string).toLowerCase()}@markPrice@1s`];

  return futuresSubscribe<Ticker | Ticker[]>(
    streams,
    (ticker) => {
      if (typeof callback === 'undefined') {
        (symbolOrCallback as MarkPriceCallback<FuturesMarkPriceTicker[]>)(
          (ticker as Ticker[]).map(convert),
        );
      } else {
        callback(convert(ticker as Ticker));
      }
    },
  );
}

/**
 * The Kline/Candlestick Stream push updates to the current klines/candlestick every 250 milliseconds (if existing).
 * @param symbolIntervalPairs - An array of [symbol, interval] tuples
 * @param callback - Stream callback
 */
export function futuresCandlesSubscribe(
  symbolIntervalPairs: [string, CandlestickChartInterval][],
  callback: (candle: FuturesChartCandle) => any,
): () => void {
  type KLineTicker = {
    e: 'kline'; // evt type
    E: number; // evt time
    s: string; // symbol
    k: Record<string, string | number | boolean>; // klines
  };
  const streams = symbolIntervalPairs.map(([symbol, interval]) => `${symbol.toLowerCase()}@kline_${interval}`);
  const intervalMap = Object.fromEntries(symbolIntervalPairs);
  return futuresSubscribe<KLineTicker>(
    streams,
    (ticker) => {
      const {
        o: open, h: high, l: low, c: close, v: volume,
        x: isFinal, q: quoteVolume, V: takerBuyBaseVolume, Q: takerBuyQuoteVolume,
        n: trades, t: time, T: closeTime,
      } = ticker.k;

      const candle: FuturesChartCandle = {
        symbol: ticker.s,
        interval: intervalMap[ticker.s],
        time: time as number,
        closeTime: closeTime as number,
        open: +open,
        high: +high,
        low: +low,
        close: +close,
        volume: +volume,
        quoteVolume: +quoteVolume,
        takerBuyBaseVolume: +takerBuyBaseVolume,
        takerBuyQuoteVolume: +takerBuyQuoteVolume,
        trades: trades as number,
        direction: +open <= +close ? 'UP' : 'DOWN',
        isFinal: isFinal as boolean,
        closeTimeISOString: new Date(closeTime as number).toISOString(),
        timeISOString: new Date(time as number).toISOString(),
      };

      callback(candle);
    },
  );
}

interface FuturesChartSubscribeOptions {
  symbol: string;
  interval: CandlestickChartInterval;
  callback: (candles: FuturesChartCandle[]) => any;
  limit: number;
  firstTickFromCache?: boolean;
}

/**
 * Loads candles and subscribes to candle updates for a given symbol and an interval. Received results are cached.
 * @param options - Subscription options
 * @param options.symbol - Symbol
 * @param options.interval - Interval
 * @param options.callback - Ticker callback
 * @param options.limit - Number of requested candles
 * @param options.firstTickFromCache - Does the last candle need to be loaded from cache
 */
export function futuresChartSubscribe({
  symbol,
  interval,
  callback,
  limit,
  firstTickFromCache,
}: FuturesChartSubscribeOptions): () => void {
  let data: null | FuturesChartCandle[] = null;

  void futuresCandles({
    symbol, interval, limit, lastCandleFromCache: firstTickFromCache,
  }).then((candles) => {
    data = candles;
    callback(data);
  });

  return futuresCandlesSubscribe([[symbol, interval]], (candle) => {
    if (!data) return;

    if (candle.time === data[data.length - 1].time) {
      Object.assign(data[data.length - 1], candle);
    } else {
      data.push(candle);
    }

    callback([...data]);
  });
}
