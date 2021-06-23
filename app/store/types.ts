import * as api from '../api';

export interface TradingPosition {
  entryPrice: number;
  positionAmt: number;
  liquidationPrice: number;
  lastPrice: number;
  isolatedMargin: number;
  isolatedWallet: number;
  symbol: string;
  baseValue: number;
  side: api.OrderSide;
  pnl: number;
  truePnl: number;
  pnlPercent: number;
  truePnlPercent: number;
  leverage: number;
  marginType: api.FuturesPositionRisk['marginType'];
  baseAsset: string;
}
export interface TradingOrder {
  clientOrderId: string;
  cumQuote: string;
  executedQty: number;
  orderId: number;
  avgPrice: number;
  origQty: number;
  price: number;
  reduceOnly: false,
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
