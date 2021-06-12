import * as api from '../api';

export interface TradingPosition {
  entryPrice: number;
  positionAmt: number;
  liquidationPrice: number;
  lastPrice: number;
  isolatedMargin: number;
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
