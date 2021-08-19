import promiseRequest from './promiseRequest';
import futuresSubscribe from './futuresSubscribe';
import {
  FuturesLeverageResponse, FuturesPositionRisk, MarginType, FuturesAggTradeStreamTicker,
  FuturesAccount, FuturesLeverageBracket, FuturesUserTrades, FuturesDepth, FuturesExchangeInfo,
  IncomeType, FuturesIncome, TimeInForce, OrderType, OrderSide,
  FuturesOrder, CandlestickChartInterval, FuturesChartCandle,
} from './types';

const isArrayUnique = (array: unknown[]) => new Set(array).size === array.length;

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

export async function futuresCandles({
  symbol, interval, limit,
}: {
  symbol: string; interval: CandlestickChartInterval; limit: number;
}): Promise<FuturesChartCandle[]> {
  const klines = await promiseRequest<(string | number)[][]>('v1/klines', {
    symbol, interval, limit,
  });

  return klines.map(([
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
    };

    return candle;
  });
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
      };

      callback(candle);
    },
  );
}

export function futuresChartSubscribe(
  symbol: string,
  interval: CandlestickChartInterval,
  callback: (futuresKlineConcat: FuturesChartCandle[]) => void,
  limit: number,
): () => void {
  let data: null | FuturesChartCandle[] = null;

  void futuresCandles({ symbol, interval, limit }).then((candles) => {
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
