import promiseRequest from './promiseRequest';
import futuresSubscribe from './futuresSubscribe';
import {
  FuturesLeverageResponse, FuturesPositionRisk, MarginType, FuturesAggTradeStreamTicker,
  FuturesAccount, FuturesLeverageBracket, FuturesUserTrades, FuturesDepth, FuturesExchangeInfo,
  IncomeType, FuturesIncome, TimeInForce, OrderType, OrderSide, FuturesOrder,
} from './types';
import convertType from '../lib/convertType';

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

export async function futuresPrices(): Promise<Record<string, string>> {
  const data = await promiseRequest<{ symbol: string; price: string }[]>('v1/ticker/price');
  return data.reduce((out, i) => {
    out[i.symbol] = i.price; // eslint-disable-line no-param-reassign
    return out;
  }, {} as Record<string, string>);
}

export async function futuresLeverageBracket(
  symbol: string,
): Promise<{ brackets: FuturesLeverageBracket[] }[]> {
  return promiseRequest('v1/leverageBracket', { symbol }, { type: 'USER_DATA' });
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
  quantity: number;
  price: number | null;
  type: OrderType;
  timeInForce?: TimeInForce;
}

export async function futuresOrder({
  side, symbol, quantity, price, type, timeInForce,
}: FuturesOrderOptions): Promise<FuturesOrder> {
  if (type !== 'MARKET' && (typeof price !== 'number' || price !== null)) throw new Error(`Orders of type ${type} must have price to be a number`);

  return promiseRequest('v1/order', {
    price: price === null ? undefined : price,
    symbol,
    type,
    side,
    quantity,
    timeInForce: !timeInForce && (type === 'LIMIT' || type === 'STOP' || type === 'TAKE_PROFIT') ? 'GTX' : timeInForce,
  }, { type: 'TRADE', method: 'POST' });
}

export async function futuresMarketBuy(symbol: string, quantity: number): Promise<FuturesOrder> {
  return futuresOrder({
    side: 'BUY', symbol, quantity, price: null, type: 'MARKET',
  });
}

export async function futuresMarketSell(symbol: string, quantity: number): Promise<FuturesOrder> {
  return futuresOrder({
    side: 'SELL', symbol, quantity, price: null, type: 'MARKET',
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

export async function balance(): Promise<unknown> {
  return promiseRequest('v1/income', {}, { type: 'SIGNED', baseURL: 'https://api.binance.com/api/' });
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

    callback(convertType<FuturesAggTradeStreamTicker>({
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
    }));
  });
}
