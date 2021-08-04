import * as api from '../api';

export type Api = typeof api; // used at plugins

export type Plugin<T> = (store: T, api: Api) => void;

export interface TradingPosition {
  entryPrice: number;
  positionAmt: number;
  initialAmt: number;
  liquidationPrice: number;
  lastPrice: number;
  isolatedMargin: number;
  isolatedWallet: number;
  symbol: string;
  baseValue: number;
  side: api.OrderSide;
  pnl: number;
  pnlPositionPercent: number;
  pnlBalancePercent: number;
  leverage: number;
  maxLeverage: number;
  marginType: api.FuturesPositionRisk['marginType'];
  baseAsset: string;
  pricePrecision: number;
  initialSize: number;
  baseSize: number;
  maintMarginRatio: number;
  maintMargin: number;
}

export interface TradingOrder {
  clientOrderId: string;
  cumQuote: string;
  executedQty: number;
  orderId: number;
  avgPrice: number;
  origQty: number;
  price: number;
  lastPrice: number;
  reduceOnly: boolean;
  side: api.OrderSide;
  positionSide: api.PositionSide;
  status: string;
  stopPrice: number;
  closePosition: boolean;
  symbol: string;
  timeInForce: api.TimeInForce;
  type: api.OrderType;
  origType: api.OrderType;
  updateTime: number;
  workingType: api.WorkingType;
  priceProtect: boolean;
}

declare global {
  interface Window { biduulPlugin: <T = Store>(plugin: Plugin<T>) => void; }
}
