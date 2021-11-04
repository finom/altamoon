import promiseRequest from './promiseRequest';
import futuresCandles from './futuresCandles';
import {
  FuturesLeverageResponse, FuturesPositionRisk, MarginType,
  FuturesAccount, FuturesLeverageBracket, FuturesUserTrades, FuturesDepth, FuturesExchangeInfo,
  IncomeType, FuturesIncome, TimeInForce, OrderType, OrderSide,
  FuturesOrder, CandlestickChartInterval,
} from './types';

export { futuresCandles };

export const futuresIntervals: CandlestickChartInterval[] = [
  '1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d', '3d', '1w', '1M',
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
 * @see {@link https://binance-docs.github.io/apidocs/futures/en/#start-user-data-stream-user_stream}
 * @returns Data stream key
 */
export async function futuresGetDataStream(): Promise<{ listenKey: string; }> {
  return promiseRequest('v1/listenKey', {}, { type: 'SIGNED', method: 'POST' });
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

/**
 * Account Trade List (USER_DATA)
 * @remarks Get trades for a specific account and symbol.
 * @see {@link https://binance-docs.github.io/apidocs/futures/en/#account-trade-list-user_data}
 * @param symbol - Symbol
 * @returns List of trades
 */
export async function futuresUserTrades(symbol: string): Promise<FuturesUserTrades[]> {
  return promiseRequest('v1/userTrades', { symbol }, { type: 'SIGNED' });
}

/**
 * Get order Book
 * @param symbol - Symbol
 */
export async function futuresDepth(symbol: string): Promise<FuturesDepth> {
  return promiseRequest('v1/depth', { symbol });
}

/**
 * Get exchange Information
 * @remarks Current exchange trading rules and symbol information
 */
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

/**
 * New Order (TRADE)
 * @remarks Send in a new order.
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
 * @returns New order
 */
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

export function futuresPositionMargin(
  symbol: string, amount: number, type: 1 | 2,
): Promise<unknown> {
  return promiseRequest('v1/positionMargin', { symbol, amount, type }, { method: 'POST', type: 'SIGNED' });
}
