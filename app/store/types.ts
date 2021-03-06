import { Layout } from 'react-grid-layout';

import * as api from '../api';

export type Api = typeof api; // used at plugins

export type Plugin<T> = (store: T) => void;

export interface TradingPosition {
  entryPrice: number;
  positionAmt: number;
  initialAmt: number;
  liquidationPrice: number;
  lastPrice: number;
  isolatedMargin: number;
  isolatedWallet: number;
  calculatedMargin: number;
  symbol: string;
  baseValue: number;
  side: api.OrderSide;
  pnl: number;
  pnlPositionPercent: number;
  pnlBalancePercent: number;
  realizedPnl: null | number;
  breakEvenPrice: null | number;
  leverage: number;
  maxLeverage: number;
  marginType: api.FuturesPositionRisk['marginType'];
  baseAsset: string;
  pricePrecision: number;
  initialValue: number;
  maintMarginRatio: number;
  maintMargin: number;
  leverageBracket: api.FuturesLeverageBracket | null;
  isClosed: boolean;
}

export interface TradingOrder {
  clientOrderId: string;
  cumQuote: string;
  executedQty: number;
  orderId: number;
  avgPrice: number;
  origQty: number;
  price: number;
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
  leverageBracket: api.FuturesLeverageBracket | null;
  marginType: api.FuturesPositionRisk['marginType'];
  leverage: number;
  isCanceled: boolean;
}

export interface AltamoonLayout {
  id: string;
  isEnabled: boolean;
  name: string;
  individualLayouts: Record<string, Pick<Layout, 'x' | 'y' | 'w' | 'h' | 'i'>>,
}

export interface OrderToBeCreated extends Pick<TradingOrder,
'clientOrderId'
| 'price'
| 'origQty'
| 'symbol'
| 'side'
| 'type'
| 'leverage'
| 'reduceOnly'
| 'executedQty'
| 'stopPrice'
| 'isCanceled'
> {
  orderId: null;
}

declare global {
  interface Window { altamoonPlugin: <T = altamoon.RootStore>(plugin: Plugin<T>) => void; }
}

export interface PriceLinesDatum<T = unknown> {
  xValue?: Date;
  yValue?: number;
  title?: string;
  color?: string;
  opacity?: number;
  id: string | number;
  isVisible?: boolean;
  isDraggable?: boolean; // non-dynamic so far
  isCheckable?: boolean; // non-dynamic so far
  isClosable?: boolean; // non-dynamic so far
  isTitleVisible?: boolean | 'hover';
  isPriceLabelVisible?: boolean;
  isHovered?: boolean;
  lineStyle?: 'solid' | 'dashed' | 'dotted' | 'none';
  customData?: T;
  pointerEventsNone?: boolean;
}
