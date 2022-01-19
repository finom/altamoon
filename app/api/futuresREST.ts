import promiseRequest from './promiseRequest';
import {
  FuturesLeverageResponse, FuturesPositionRisk, MarginType, ExtendedCandlestickChartInterval,
  FuturesAccount, FuturesLeverageBracket, FuturesUserTrade, FuturesDepth, FuturesExchangeInfo,
  IncomeType, FuturesIncome, TimeInForce, OrderType, OrderSide,
  FuturesOrder, CandlestickChartInterval, FuturesChartCandle,
} from './types';

/**
 * Array of all Binance intervals.
 * @example
 * ```ts
 * import { futuresIntervals } from 'altamoon-binance-api';
 *
 * console.log(futuresIntervals);
 * ```
 */
export const futuresIntervals: CandlestickChartInterval[] = [
  '1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d', '3d', '1w', '1M',
];

/**
 * Array of extended intervals.
 */
export const extendedFuturesIntervals: ExtendedCandlestickChartInterval[] = [
  '2m', '10m', '2d', '4d', '2w', '2M',
];

export const allFuturesIntervals: (
  CandlestickChartInterval | ExtendedCandlestickChartInterval
)[] = [
  '1m', '2m', '3m', '5m', '10m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d', '2d', '3d', '4d', '1w', '2w', '1M', '2M',
];

/**
 * Change Initial Leverage (TRADE)
 * @remarks Change user's initial leverage of specific symbol market.
 * @see {@link https://binance-docs.github.io/apidocs/futures/en/#change-initial-leverage-trade}
 * @param symbol - Symbol
 * @param leverage - Target initial leverage: int from 1 to 125
 */
export async function futuresLeverage(
  symbol: string, leverage: number,
): Promise<FuturesLeverageResponse> {
  return promiseRequest('v1/leverage', { symbol, leverage }, { method: 'POST', type: 'SIGNED' });
}

/**
 * Change Margin Type (TRADE)
 * @see {@link https://binance-docs.github.io/apidocs/futures/en/#change-margin-type-trade}
 * @param symbol - Symbol
 * @param marginType - Margin type
 */
export async function futuresMarginType(symbol: string, marginType: MarginType): Promise<void> {
  return promiseRequest('v1/marginType', { symbol, marginType }, { method: 'POST', type: 'SIGNED' });
}

/**
 * Position Information V2 (USER_DATA)
 * @see {@link https://binance-docs.github.io/apidocs/futures/en/#position-information-v2-user_data}
 * @remarks Get current position information.
 */
export async function futuresPositionRisk(): Promise<FuturesPositionRisk[]> {
  return promiseRequest('v2/positionRisk', {}, { type: 'SIGNED' });
}

/**
 * Current All Open Orders (USER_DATA)
 * @remarks Get all open orders on a symbol.
 * @see {@link https://binance-docs.github.io/apidocs/futures/en/#current-all-open-orders-user_data}
 * Careful when accessing this with no symbol because of high weight.
 * @param symbol - Symbol
 */
export async function futuresOpenOrders(symbol?: string): Promise<FuturesOrder[]> {
  return promiseRequest('v1/openOrders', symbol ? { symbol } : {}, { type: 'SIGNED' });
}

/**
 * All Orders (USER_DATA)
 * @remarks Get all account orders; active, canceled, or filled.
 * @see {@link https://binance-docs.github.io/apidocs/futures/en/#all-orders-user_data}
 * @param symbol - Symbol
 */
export async function futuresAllOrders(symbol?: string): Promise<FuturesOrder[]> {
  return promiseRequest('v1/allOrders', symbol ? { symbol } : {}, { type: 'SIGNED' });
}

/**
 * Latest price for all symbols
 * @see {@link https://binance-docs.github.io/apidocs/futures/en/#symbol-price-ticker}
 * @returns An object of symbols and corresponding prices
 */
export async function futuresPrices(): Promise<Record<string, string>> {
  const data = await promiseRequest<{ symbol: string; price: string }[]>('v1/ticker/price');
  return data.reduce((out, i) => {
    out[i.symbol] = i.price; // eslint-disable-line no-param-reassign
    return out;
  }, {} as Record<string, string>);
}

/**
 * Notional and Leverage Brackets (USER_DATA)
 * @see {@link https://binance-docs.github.io/apidocs/futures/en/#notional-and-leverage-brackets-user_data}
 * @param symbol - Symbol
 * @returns Brackets
 */
export async function futuresLeverageBracket(
  symbol?: string,
): Promise<{ symbol: string; brackets: FuturesLeverageBracket[] }[]> {
  return promiseRequest('v1/leverageBracket', symbol ? { symbol } : {}, { type: 'USER_DATA' });
}

/**
 * Start User Data Stream (USER_STREAM)
 * @remarks
 * Start a new user data stream. The stream will close after 60 minutes unless a keepalive is sent.
 * If the account has an active listenKey, that listenKey will be returned
 * and its validity will be extended for 60 minutes.
 * @param method - Request method (GET, POST or PUT)
 * @see {@link https://binance-docs.github.io/apidocs/futures/en/#start-user-data-stream-user_stream}
 * @returns Data stream key
 */
export async function futuresUserDataStream(method: 'GET' | 'POST' | 'PUT'): Promise<{ listenKey: string; }> {
  return promiseRequest('v1/listenKey', {}, { type: 'SIGNED', method });
}

/**
 * Account Information V2 (USER_DATA)
 * @remarks Get current account information.
 * @see {@link https://binance-docs.github.io/apidocs/futures/en/#account-information-v2-user_data}
 * @returns Account information
 */
export async function futuresAccount(): Promise<FuturesAccount> {
  return promiseRequest('v2/account', {}, { type: 'SIGNED' });
}

interface UserTradesOptions {
  symbol: string;
  startTime?: number;
  endTime?: number;
  fromId?: number;
  limit?: number;
}
/**
 * Account Trade List (USER_DATA)
 * @remarks Get trades for a specific account and symbol.
 * @see {@link https://binance-docs.github.io/apidocs/futures/en/#account-trade-list-user_data}
 * @param options - Request options
 * @param options.symbol - Symbol
 * @param options.startTime - Start time
 * @param options.endTime - End time
 * @param options.fromId - Trade id to fetch from. Default gets most recent trades.
 * @param options.limit - Limit
 * @returns List of trades
 */
export async function futuresUserTrades({
  symbol,
  startTime,
  endTime,
  fromId,
  limit,
}: UserTradesOptions): Promise<FuturesUserTrade[]> {
  return promiseRequest('v1/userTrades', {
    symbol,
    startTime,
    endTime,
    fromId,
    limit,
  }, { type: 'SIGNED' });
}

/**
 * Get order Book
 * @param symbol - Symbol
 */
export async function futuresDepth(symbol: string): Promise<FuturesDepth> {
  return promiseRequest('v1/depth', { symbol });
}

let exchangeInfoPromise: Promise<FuturesExchangeInfo>;
/**
 * Get exchange Information
 * @remarks Current exchange trading rules and symbol information
 */
export async function futuresExchangeInfo(): Promise<FuturesExchangeInfo> {
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  if (!exchangeInfoPromise) {
    // make the request run only once
    exchangeInfoPromise = promiseRequest('v1/exchangeInfo');
  }

  return exchangeInfoPromise;
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
  newClientOrderId?: string;
}

/**
 * New Order (TRADE)
 * @remarks Send in a new order. This is the general function used internally by `futuresMarketOrder`, `futuresLimitOrder` etc.
 * @see {@link https://binance-docs.github.io/apidocs/futures/en/#new-order-trade}
 * @param options - Order options
 * @param options.side - Order side
 * @param options.symbol - Symbol
 * @param options.quantity - Quantity
 * @param options.price - Price (for limit and stop limit orders)
 * @param options.stopPrice - Stop orice (for stop orders)
 * @param options.type - Order type
 * @param options.timeInForce - Time in force
 * @param options.reduceOnly - Reduce only
 * @param options.newClientOrderId - A unique id among open orders. Automatically generated if not sent.
 * @returns New order
 */
export async function futuresOrder({
  side, symbol, quantity, price, stopPrice, type, timeInForce, reduceOnly, newClientOrderId,
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
    newClientOrderId,
  }, { type: 'TRADE', method: 'POST' });
}

/**
 * Create market order
 * @param side - Order side
 * @param symbol - Symbol
 * @param quantity - Quantity
 * @param options - Additional order options
 * @param options.reduceOnly - Reduce only
 * @returns New order
 */
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

/**
 * Create limit order
 * @param side - Order side
 * @param symbol - Symbol
 * @param quantity - Quantity
 * @param price - Price
 * @param options - Additional order options
 * @param options.reduceOnly - Reduce only
 * @param options.timeInForce - Time in force
 * @param options.newClientOrderId - A unique id among open orders. Automatically generated if not sent
 * @returns New order
 */
export async function futuresLimitOrder(
  side: OrderSide,
  symbol: string,
  quantity: number | string,
  price: number | string,
  {
    reduceOnly, timeInForce, newClientOrderId,
  }: { reduceOnly?: boolean; timeInForce?: TimeInForce; newClientOrderId?: string; } = {},
): Promise<FuturesOrder> {
  return futuresOrder({
    side,
    symbol,
    quantity,
    price,
    stopPrice: null,
    type: 'LIMIT',
    reduceOnly,
    timeInForce,
    newClientOrderId,
  });
}

/**
 * Create stop market order
 * @param side - Order side
 * @param symbol - Symbol
 * @param quantity - Quantity
 * @param stopPrice - Stop price
 * @param options - Additional order options
 * @param options.reduceOnly - Reduce only
 * @returns New order
 */
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
/**
 * Create stop market order
 * @param side - Order side
 * @param symbol - Symbol
 * @param quantity - Quantity
 * @param price - Price
 * @param stopPrice - Stop price
 * @param options - Additional order options
 * @param options.reduceOnly - Reduce only
 * @param options.timeInForce - Time in force
 * @param options.newClientOrderId - A unique id among open orders. Automatically generated if not sent
 * @returns New order
 */
export async function futuresStopLimitOrder(
  side: OrderSide,
  symbol: string,
  quantity: number | string,
  price: number | string,
  stopPrice: number | string,
  {
    reduceOnly, timeInForce, newClientOrderId,
  }: { reduceOnly?: boolean; timeInForce?: TimeInForce, newClientOrderId?: string; } = {},
): Promise<FuturesOrder> {
  return futuresOrder({
    side, symbol, quantity, price, type: 'STOP', reduceOnly, timeInForce, stopPrice, newClientOrderId,
  });
}

/**
 * Get Income History (USER_DATA)
 * @param params - Request params
 * @param params.symbol - Symbol
 * @param params.incomeType - Incomr type
 * @param params.startTime - Timestamp in ms to get funding from INCLUSIVE.
 * @param params.endTime - Timestamp in ms to get funding until INCLUSIVE
 * @param params.limit - Default 100; max 1000
 * @param params.recvWindow - Specify the number of milliseconds after timestamp the request is valid for
 * @param params.timestamp - Millisecond timestamp of when the request was created and sent
 * @returns Income information array
 */
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

/**
 * Cancel Order (TRADE)
 * @remarks Cancel an active order. Either `orderId` or `origClientOrderId` must be sent.
 * @param symbol - Symbol
 * @param options - Order information
 * @param options.orderId - Order ID
 * @param options.origClientOrderId - Previously used newClientOrderId
 * @returns Canceled order
 */
export async function futuresCancelOrder(
  symbol: string,
  { orderId, origClientOrderId } : { orderId?: number; origClientOrderId?: string; },
): Promise<FuturesOrder> {
  return promiseRequest('v1/order', { symbol, orderId, origClientOrderId }, { type: 'SIGNED', method: 'DELETE' });
}

/**
 * Cancel All Open Orders (TRADE)
 * @param symbol - Symbol
 * @returns Request info
 */
export async function futuresCancelAllOrders(symbol: string): Promise<{ msg: string; code: 200; }> {
  return promiseRequest('v1/allOpenOrders', { symbol }, { type: 'SIGNED', method: 'DELETE' });
}

/**
 * Modify Isolated Position Margin (TRADE)
 * @param symbol - Symbol
 * @param amount - Amount
 * @param type - 1: Add position margin，2: Reduce position margin
 * @returns Request info
 */
export function futuresPositionMargin(
  symbol: string, amount: number, type: 1 | 2,
): Promise<unknown> {
  return promiseRequest('v1/positionMargin', { symbol, amount, type }, { method: 'POST', type: 'SIGNED' });
}

/**
 *
 * @param options - Request options
 * @param options.symbol - Symbol
 * @param options.interval - Interval
 * @param options.symbol - Start time
 * @param options.symbol - End time
 * @returns Candles
 */
export async function futuresKLines(options: {
  symbol: string;
  interval: CandlestickChartInterval;
  startTime?: number;
  endTime?: number;
  limit?: number;
}) {
  const klines = await promiseRequest<(string | number)[][]>('v1/klines', options);

  return klines.map(([
    time, open, high, low, close, volume, closeTime, quoteVolume,
    trades, takerBuyBaseVolume, takerBuyQuoteVolume,
  ]) => {
    const candle: FuturesChartCandle = {
      symbol: options.symbol,
      interval: options.interval,
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
}
