import localForage from 'localforage';
import promiseRequest from './promiseRequest';
import futuresSubscribe from './futuresSubscribe';
import {
  FuturesLeverageResponse, FuturesPositionRisk, MarginType, FuturesAggTradeStreamTicker,
  FuturesAccount, FuturesLeverageBracket, FuturesUserTrades, FuturesDepth, FuturesExchangeInfo,
  IncomeType, FuturesIncome, TimeInForce, OrderType, OrderSide,
  FuturesOrder, CandlestickChartInterval, FuturesChartCandle,
} from './types';

const isArrayUnique = (array: unknown[]) => new Set(array).size === array.length;

export const futuresIntervals: CandlestickChartInterval[] = [
  '1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d', '3d', '1w', '1M',
];

export async function futuresLeverage(
  symbol: string, leverage: number,
): Promise<FuturesLeverageResponse> {
  return promiseRequest('v1/leverage', { symbol, leverage }, { method: 'POST', type: 'SIGNED' });
}

export async function futuresMarginType(symbol: string, marginType: MarginType): Promise<void> {
  return promiseRequest('v1/marginType', { symbol, marginType }, { method: 'POST', type: 'SIGNED' });
}

export async function futuresPositionRisk(): Promise<FuturesPositionRisk[]> {
  return promiseRequest('v2/positionRisk', {}, { type: 'SIGNED' });
}

export async function futuresOpenOrders(symbol?: string): Promise<FuturesOrder[]> {
  return promiseRequest('v1/openOrders', symbol ? { symbol } : {}, { type: 'SIGNED' });
}

export async function futuresPrices(): Promise<Record<string, string>> {
  const data = await promiseRequest<{ symbol: string; price: string }[]>('v1/ticker/price');
  return data.reduce((out, i) => {
    out[i.symbol] = i.price; // eslint-disable-line no-param-reassign
    return out;
  }, {} as Record<string, string>);
}

export async function futuresLeverageBracket(
  symbol?: string,
): Promise<{ symbol: string; brackets: FuturesLeverageBracket[] }[]> {
  return promiseRequest('v1/leverageBracket', symbol ? { symbol } : {}, { type: 'USER_DATA' });
}

export async function futuresGetDataStream(): Promise<{ listenKey: string; }> {
  return promiseRequest('v1/listenKey', {}, { type: 'SIGNED', method: 'POST' });
}

export async function futuresAccount(): Promise<FuturesAccount> {
  return promiseRequest('v2/account', {}, { type: 'SIGNED' });
}

export async function futuresUserTrades(symbol: string): Promise<FuturesUserTrades[]> {
  return promiseRequest('v1/userTrades', { symbol }, { type: 'SIGNED' });
}

export async function futuresDepth(symbol: string): Promise<FuturesDepth> {
  return promiseRequest('v1/depth', { symbol });
}

export async function futuresExchangeInfo(): Promise<FuturesExchangeInfo> {
  return promiseRequest('v1/exchangeInfo');
}

interface FuturesOrderOptions {
  side: OrderSide;
  symbol: string;
  quantity: number | string;
  price: number | string | null;
  stopPrice: number | string | null;
  type: OrderType;
  timeInForce?: TimeInForce;
  reduceOnly?: boolean;
}

export async function futuresOrder({
  side, symbol, quantity, price, stopPrice, type, timeInForce, reduceOnly,
}: FuturesOrderOptions): Promise<FuturesOrder> {
  if ((type === 'LIMIT' || type === 'STOP') && typeof price !== 'number' && typeof price !== 'string') throw new Error(`Orders of type ${type} must have price to be a number`);
  if ((type === 'STOP' || type === 'STOP_MARKET') && typeof stopPrice !== 'number' && typeof stopPrice !== 'string') throw new Error(`Orders of type ${type} must have stopPrice to be a number`);

  return promiseRequest('v1/order', {
    price: price ?? undefined,
    stopPrice: stopPrice ?? undefined,
    symbol,
    type,
    side,
    quantity,
    timeInForce: !timeInForce && (type === 'LIMIT' || type === 'STOP' || type === 'TAKE_PROFIT') ? 'GTX' : timeInForce,
    reduceOnly,
  }, { type: 'TRADE', method: 'POST' });
}

export async function futuresMarketOrder(
  side: OrderSide,
  symbol: string,
  quantity: number | string,
  { reduceOnly }: { reduceOnly?: boolean; } = {},
): Promise<FuturesOrder> {
  return futuresOrder({
    side, symbol, quantity, price: null, stopPrice: null, type: 'MARKET', reduceOnly,
  });
}

export async function futuresLimitOrder(
  side: OrderSide,
  symbol: string,
  quantity: number | string,
  price: number | string,
  { reduceOnly, timeInForce }: { reduceOnly?: boolean; timeInForce?: TimeInForce } = {},
): Promise<FuturesOrder> {
  return futuresOrder({
    side, symbol, quantity, price, stopPrice: null, type: 'LIMIT', reduceOnly, timeInForce,
  });
}

export async function futuresStopMarketOrder(
  side: OrderSide,
  symbol: string,
  quantity: number | string,
  stopPrice: number | string,
  { reduceOnly }: { reduceOnly?: boolean; } = {},
): Promise<FuturesOrder> {
  return futuresOrder({
    side, symbol, quantity, price: null, type: 'STOP_MARKET', reduceOnly, stopPrice,
  });
}

export async function futuresStopLimitOrder(
  side: OrderSide,
  symbol: string,
  quantity: number | string,
  price: number | string,
  stopPrice: number | string,
  { reduceOnly, timeInForce }: { reduceOnly?: boolean; timeInForce?: TimeInForce } = {},
): Promise<FuturesOrder> {
  return futuresOrder({
    side, symbol, quantity, price, type: 'STOP', reduceOnly, timeInForce, stopPrice,
  });
}

export async function futuresIncome(params: {
  symbol?: string;
  incomeType?: IncomeType;
  startTime?: number;
  endTime?: number;
  limit?: number;
  recvWindow?: number;
  timestamp?: number;
}): Promise<FuturesIncome[]> {
  return promiseRequest('v1/income', params, { type: 'SIGNED' });
}

// Either orderId or origClientOrderId must be sent
export async function futuresCancel(symbol: string, orderId: number): Promise<FuturesOrder> {
  return promiseRequest('v1/order', { symbol, orderId }, { type: 'SIGNED', method: 'DELETE' });
}

export async function futuresCancelAll(symbol: string): Promise<{ msg: string; code: 200; }> {
  return promiseRequest('v1/allOpenOrders', { symbol }, { type: 'SIGNED', method: 'DELETE' });
}

export function futuresAggTradeStream(
  givenSymbols: string | string[], callback: (ticker: FuturesAggTradeStreamTicker) => void,
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

export function futuresPositionMargin(
  symbol: string, amount: number, type: 1 | 2,
): Promise<unknown> {
  return promiseRequest('v1/positionMargin', { symbol, amount, type }, { method: 'POST', type: 'SIGNED' });
}

const intervalStrToMs = (interval: Exclude<CandlestickChartInterval, '1M'>) => {
  const num = +interval.replace(/(\d+)\S/, '$1');
  const sym = interval.replace(/\d+(\S)/, '$1') as 'm' | 'h' | 'd' | 'w';
  const m = 1000 * 60;
  const h = m * 60;
  const d = h * 24;
  const w = d * 7;

  return {
    m: m * num,
    h: h * num,
    d: d * num,
    w: w * num,
  }[sym];
};

export async function futuresCandles({
  symbol, interval, limit, lastCandleFromCache,
}: {
  symbol: string; interval: CandlestickChartInterval; limit: number; lastCandleFromCache?: boolean;
}): Promise<FuturesChartCandle[]> {
  const storageKey = `${symbol}_${interval}`;
  let startDate: number | undefined;
  let calculatedLimit = limit;
  let cachedCandles: FuturesChartCandle[] = [];

  try {
    const storedValue: string | null = await localForage.getItem(storageKey);
    cachedCandles = JSON.parse(storedValue ?? '[]') as FuturesChartCandle[];
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
  }

  const lastCachedCandleOpenTime = cachedCandles.length
    ? cachedCandles[cachedCandles.length - 1].time
    : 0;
  const lastCachedCandleCloseTime = cachedCandles.length
    ? cachedCandles[cachedCandles.length - 1].closeTime
    : 0;
  const firstCachedCandleOpenTime = cachedCandles.length ? cachedCandles[0].time : Infinity;
  const isFirstCachedCandleFirstEver = cachedCandles[0]?.isFirstEver ?? false;

  if (interval !== '1M') {
    const expectedCandlesStartDate = Date.now() - intervalStrToMs(interval) * (limit - 1);

    // if last cached candle time overlaps reqested candle time (May 1 ... May 5, May 3 ... May 7)
    if (
      lastCachedCandleCloseTime >= expectedCandlesStartDate
      && (firstCachedCandleOpenTime <= expectedCandlesStartDate || isFirstCachedCandleFirstEver)
    ) {
      startDate = lastCachedCandleCloseTime;
      calculatedLimit = Math[lastCandleFromCache ? 'floor' : 'ceil'](
        (Date.now() - lastCachedCandleOpenTime) / intervalStrToMs(interval),
      );

      if (!lastCandleFromCache) cachedCandles.pop();
    }
  } else { // 1M calculated differently since 1 month cannot be converted into exact amount of ms
    const expectedStartDate = new Date();
    expectedStartDate.setHours(0, 0, 0);
    expectedStartDate.setTime(
      expectedStartDate.getTime() - expectedStartDate.getTimezoneOffset() * 60 * 1000,
    );
    expectedStartDate.setMonth(expectedStartDate.getMonth() - limit + 1);
    expectedStartDate.setMilliseconds(0);
    expectedStartDate.setDate(1);
    const expectedCandlesStartDate = expectedStartDate.getTime();

    if (
      lastCachedCandleCloseTime >= expectedCandlesStartDate
      && (firstCachedCandleOpenTime <= expectedCandlesStartDate || isFirstCachedCandleFirstEver)
    ) {
      const currentDate = new Date();
      const lastCandleDate = new Date(lastCachedCandleOpenTime);
      startDate = lastCachedCandleCloseTime;
      calculatedLimit = currentDate.getMonth() - lastCandleDate.getMonth()
        + (12 * (currentDate.getFullYear() - lastCandleDate.getFullYear()))
        + (lastCandleFromCache ? 0 : 1);

      if (!lastCandleFromCache) cachedCandles.pop();
    }
  }

  const klines = calculatedLimit === 0 ? [] : await promiseRequest<(string | number)[][]>('v1/klines', {
    symbol, interval, limit: calculatedLimit, startDate,
  });

  const requestedCandles = klines.map(([
    time, open, high, low, close, volume, closeTime, quoteVolume,
    trades, takerBuyBaseVolume, takerBuyQuoteVolume,
  ]) => {
    const candle: FuturesChartCandle = {
      symbol,
      interval,
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
      closeTimeISOString: new Date(closeTime as number).toISOString(),
      timeISOString: new Date(time as number).toISOString(),
    };

    return candle;
  });

  if (requestedCandles.length && requestedCandles.length < calculatedLimit) {
    requestedCandles[0].isFirstEver = true;
  }

  const candles = startDate
    ? [
      ...cachedCandles.filter(({ isFinal }) => isFinal !== false || requestedCandles.length === 0),
      ...requestedCandles,
    ]
    : requestedCandles;

  try {
    await localForage.setItem(
      storageKey, JSON.stringify(candles),
    );
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
  }

  return candles;
}

export function futuresCandlesSubscribe(
  symbolIntervalPairs: [string, CandlestickChartInterval][],
  callback: (candle: FuturesChartCandle) => void,
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
  callback: (candles: FuturesChartCandle[]) => void;
  limit: number;
  firstTickFromCache?: boolean;
}

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
