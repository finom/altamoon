export interface WorkerCandlesMessageBack {
  type: 'ALL_CANDLES' | 'NEW_CANDLE' | 'EXTEND_LAST_CANDLE';
  subscriptionId: string;
  symbol: string;
  candlesArray: Float64Array;
  interval: CandlestickChartInterval | SubminutedCandlestickChartInterval;
}

export interface WorkerSubscribeMessage {
  type: 'SUBSCRIBE';
  symbols: string[];
  frequency: number;
  subscriptionId: string;
}

export interface WorkerUnsubscribeMessage {
  type: 'UNSUBSCRIBE';
  subscriptionId: string;
}

export interface WorkerInitMessage {
  type: 'INIT';
  allSymbols: string[];
  interval: CandlestickChartInterval | SubminutedCandlestickChartInterval;
  isTestnet?: boolean;
}

export type PositionSide = 'BOTH' | 'LONG' | 'SHORT';
export type OrderSide = 'BUY' | 'SELL';
export type MarginType = 'ISOLATED' | 'CROSSED';
export type PositionMarginType = 'isolated' | 'cross';
export type CandlestickChartInterval = '1m' | '3m' | '5m' | '15m' | '30m' | '1h' | '2h' | '4h' | '6h' | '8h' | '12h' | '1d' | '3d' | '1w' | '1M';
export type ExtendedCandlestickChartInterval = '2m' | '10m' | '2d' | '4d' | '2w' | '2M';
export type SubminutedCandlestickChartInterval = '5s' | '10s' | '15s' | '30s';
export type ContractType = 'PERPETUAL' | 'CURRENT_MONTH' | 'NEXT_MONTH' | 'CURRENT_MONTH_DELIVERING' | 'NEXT_MONTH_DELIVERING';
export type RateLimitInterval = 'MINUTE' | 'SECOND' | 'DAY';
export type OrderType = 'LIMIT' | 'MARKET' | 'STOP' | 'STOP_MARKET' | 'TAKE_PROFIT' | 'TAKE_PROFIT_MARKET' | 'TRAILING_STOP_MARKET';
export type OrderStatus = 'NEW' | 'PARTIALLY_FILLED' | 'FILLED' | 'CANCELED' | 'REJECTED' | 'EXPIRED' | 'NEW_INSURANCE' | 'NEW_ADL';
export type OrderExecutionType = 'NEW' | 'CANCELED' | 'CALCULATED' | 'EXPIRED' | 'TRADE';
export type RateLimiter = 'REQUEST_WEIGHT' | 'ORDERS';
/**
 * Time in force (timeInForce):
 * GTC - Good Till Cancel
 * IOC - Immediate or Cancel
 * FOK - Fill or Kill
 * GTX - Good Till Crossing (Post Only)
 */
export type TimeInForce = 'GTC' | 'IOC' | 'FOK' | 'GTX';
export type IncomeType = 'TRANSFER' | 'WELCOME_BONUS' | 'REALIZED_PNL' | 'FUNDING_FEE' | 'COMMISSION' | 'INSURANCE_CLEAR';
export type WorkingType = 'MARK_PRICE' | 'CONTRACT_PRICE';

export interface FuturesPositionRisk {
  entryPrice: string;
  isAutoAddMargin: 'true' | 'false';
  isolatedMargin: string;
  isolatedWallet: string;
  leverage: string;
  liquidationPrice: string;
  marginType: PositionMarginType;
  markPrice: string;
  maxNotionalValue: string;
  notional: string;
  positionAmt: string;
  positionSide: PositionSide;
  symbol: string;
  unRealizedProfit: string;
  updateTime: number;
}

export interface FuturesLeverageResponse {
  leverage: number;
  maxNotionalValue: string;
  symbol: string;
}

export interface FuturesAggTrade {
  aggTradeId: number;
  amount: string;
  firstTradeId: number;
  lastTradeId: number;
  maker: boolean;
  price: string;
  symbol: string;
  timestamp: number;
}

export interface FuturesAggTradeStreamTicker {
  aggTradeId: number;
  amount: string;
  eventTime: number;
  eventType: 'aggTrade';
  firstTradeId: number;
  lastTradeId: number;
  maker: boolean;
  price: string;
  symbol: string;
  timestamp: number;
  total: number;
}

export interface FuturesMarkPriceTicker {
  eventType: 'markPriceUpdate';
  eventTime: number;
  symbol: string;
  markPrice: string;
  indexPrice: string;
  fundingRate: string;
  fundingTime: number;
}

// https://binance-docs.github.io/apidocs/futures/en/#notional-and-leverage-brackets-user_data
export interface FuturesLeverageBracket {
  bracket: number; // Notional bracket
  cum: number; // Auxiliary number for quick calculation
  initialLeverage: number; // Max initial leverage for this bracket
  maintMarginRatio: number; // Maintenance ratio for this bracket
  notionalCap: number; // Cap notional of this bracket
  notionalFloor: number; // Notional threshold of this bracket
}

export interface FutureAsset {
  asset: string;
  availableBalance: string;
  crossUnPnl: string;
  crossWalletBalance: string;
  initialMargin: string;
  maintMargin: string;
  marginBalance: string;
  maxWithdrawAmount: string;
  openOrderInitialMargin: string;
  positionInitialMargin: string;
  unrealizedProfit: string;
  walletBalance: string;
}

export interface FuturePosition {
  entryPrice: string;
  initialMargin: string;
  isolated: boolean;
  isolatedWallet: string;
  leverage: string;
  maintMargin: string;
  maxNotional: string;
  notional: string;
  openOrderInitialMargin: string;
  positionAmt: string;
  positionInitialMargin: string;
  positionSide: PositionSide;
  symbol: string;
  unrealizedProfit: string;
}

export interface FuturesAccount {
  assets: FutureAsset[];
  availableBalance: string;
  canDeposit: boolean;
  canTrade: boolean;
  canWithdraw: boolean;
  feeTier: number;
  maxWithdrawAmount: string;
  positions: FuturePosition[];
  totalCrossUnPnl: string;
  totalCrossWalletBalance: string;
  totalInitialMargin: string;
  totalMaintMargin: string;
  totalMarginBalance: string;
  totalOpenOrderInitialMargin: string;
  totalPositionInitialMargin: string;
  totalUnrealizedProfit: string;
  totalWalletBalance: string;
  updateTime: number;
}

export interface FuturesChartCandle {
  symbol: string;
  interval: CandlestickChartInterval
  | ExtendedCandlestickChartInterval
  | SubminutedCandlestickChartInterval;
  close: number;
  closeTime: number;
  high: number;
  low: number;
  open: number;
  quoteVolume: number;
  takerBuyBaseVolume: number;
  takerBuyQuoteVolume: number;
  time: number;
  trades: number;
  volume: number;
  isFinal?: boolean;
  direction: 'UP' | 'DOWN';
  closeTimeISOString: string;
  timeISOString: string;
  isFirstEver?: boolean;
}

export interface FuturesMiniTicker {
  time: number; // Event time
  symbol: string; // Symbol
  close: string; // Close price
  open: string; // Open price
  high: string; // High price
  low: string; // Low price
  volume: string; // Total traded base asset volume
  quoteVolume: string; // Total traded quote asset volume
}

export interface FuturesTicker {
  time: number; // Event time
  symbol: string; // Symbol
  priceChange: string; // Price change
  priceChangePercent: string; // Price change percent
  averagePrice: string; // Weighted average price
  close: string; // Last price
  lastQuantity: string; // Last quantity
  open: string; // Open price
  high: string; // High price
  low: string; // Low price
  volume: string; // Total traded base asset volume
  quoteVolume: string; // Total traded quote asset volume
  openTime: number; // Statistics open time
  closeTime: number; // Statistics close time
  firstTradeId: number; // First trade ID
  lastTradeId: number; // Last trade Id
  numberOfTrades: number; // Total number of trades
}

export interface FuturesUserTrade {
  buyer: boolean;
  commission: string;
  commissionAsset: string;
  id: number;
  maker: boolean;
  marginAsset: string;
  orderId: number;
  positionSide: PositionSide;
  price: string;
  qty: string;
  quoteQty: string;
  realizedPnl: string;
  side: OrderSide;
  symbol: string;
  time: number;
}

export interface FuturesDepth {
  E: number;
  T: number;
  asks: [string, string][];
  bids: [string, string][];
  lastUpdateId: number;
}

export type FuturesExchangeInfoFilter =
{
  filterType: 'PRICE_FILTER';
  maxPrice: string;
  minPrice: string;
  tickSize: string;
} | {
  filterType: 'LOT_SIZE';
  maxQty: string;
  minQty: string;
  stepSize: string;
} | {
  filterType: 'MARKET_LOT_SIZE';
  maxQty: string;
  minQty: string;
  stepSize: string;
} | {
  filterType: 'MAX_NUM_ORDERS';
  limit: number;
} | {
  filterType: 'MAX_NUM_ALGO_ORDERS';
  limit: number;
} | {
  filterType: 'MIN_NOTIONAL';
  notional: string;
} | {
  filterType: 'PERCENT_PRICE';
  multiplierDecimal: string;
  multiplierDown: string;
  multiplierUp: string;
};

export interface FuturesExchangeInfoSymbol {
  baseAsset: string;
  baseAssetPrecision: number;
  contractType: ContractType;
  deliveryDate: number;
  filters: FuturesExchangeInfoFilter[];
  maintMarginPercent: string;
  marginAsset: string;
  onboardDate: number;
  orderTypes: OrderType[];
  pair: string;
  pricePrecision: number;
  quantityPrecision: number;
  quoteAsset: string;
  quotePrecision: number;
  requiredMarginPercent: string;
  settlePlan: number;
  status: string;
  symbol: string;
  timeInForce: TimeInForce[];
  triggerProtect: string;
  underlyingSubType: unknown[]
  underlyingType: string;
}

export interface FuturesExchangeInfo {
  exchangeFilters: unknown[];
  futuresType: string;
  rateLimits: {
    interval: RateLimitInterval;
    intervalNum: number;
    limit: number;
    rateLimitType: RateLimiter;
  }[]
  serverTime: number;
  symbols: FuturesExchangeInfoSymbol[]
  timezone: string;
}

export interface FuturesIncome {
  symbol: string;
  incomeType: IncomeType;
  income: string;
  asset: string;
  info: string;
  time: number;
  tranId: string;
  tradeId: string;
}

export interface FuturesOrder {
  clientOrderId: string;
  cumQty?: string;
  cumQuote: string;
  executedQty: string;
  orderId: number;
  avgPrice: string;
  origQty: string;
  price: string;
  reduceOnly: boolean;
  side: OrderSide;
  positionSide: PositionSide;
  status: OrderStatus;
  stopPrice: string;
  closePosition: boolean;
  symbol: string;
  timeInForce: TimeInForce;
  type: OrderType;
  origType: OrderType;
  activatePrice?: string;
  priceRate?: string;
  updateTime: number;
  workingType: WorkingType;
  priceProtect: boolean;
}

export interface BalanceItem {
  available: string;
  onOrder: string;
}

export interface UserDataEventExpired {
  e: 'listenKeyExpired'; // event type
  E: number; // event time
}

export interface UserDataEventMarginCallPosition {
  s: string; // Symbol
  ps: PositionSide; // Position Side
  pa: string; // Position Amount
  mt: MarginType; // Margin Type
  iw: string; // Isolated Wallet (if isolated position)
  mp: string; // Mark Price
  up: string; // Unrealized PnL
  mm: string; // Maintenance Margin Required
}

export interface UserDataEventMarginCall {
  e: 'MARGIN_CALL'; // Event Type
  E: number; // Event Time
  cw: string; // Cross Wallet Balance. Only pushed with crossed position margin call
  p: UserDataEventMarginCallPosition[]; // Position(s) of Margin Call
}

export type UserDataEventAccountUpdateReason = 'DEPOSIT'
| 'WITHDRAW'
| 'ORDER'
| 'FUNDING_FEE'
| 'WITHDRAW_REJECT'
| 'ADJUSTMENT'
| 'INSURANCE_CLEAR'
| 'ADMIN_DEPOSIT'
| 'ADMIN_WITHDRAW'
| 'MARGIN_TRANSFER'
| 'MARGIN_TYPE_CHANGE'
| 'ASSET_TRANSFER'
| 'OPTIONS_PREMIUM_FEE'
| 'OPTIONS_SETTLE_PROFIT'
| 'AUTO_EXCHANGE';

export interface UserDataEventAccountUpdateBalance {
  a: string; // Asset
  wb: string; // Wallet Balance
  cw: string; // Cross Wallet Balance
  bc: string; // Balance Change except PnL and Commission
}

export interface UserDataEventAccountUpdatePosition {
  s: string; // Symbol
  pa: string; // Position Amount
  ep: string; // Entry Price
  cr: string; // (Pre-fee) Accumulated Realized
  up: string; // Unrealized PnL
  mt: PositionMarginType; // Margin Type
  iw: string; // Isolated Wallet (if isolated position)
  ps: PositionSide; // Position Side
}

export interface UserDataEventAccountUpdateData {
  m: UserDataEventAccountUpdateReason; // Event reason type
  B: UserDataEventAccountUpdateBalance[];
  P: UserDataEventAccountUpdatePosition[];
}

export interface UserDataEventAccountUpdate {
  e: 'ACCOUNT_UPDATE'; // Event Type
  E: number; // Event Time
  T: number; // Transaction
  a: UserDataEventAccountUpdateData; // Update Data
}

export interface UserDataEventOrderUpdateData {
  s: string; // Symbol
  c: string; // Client Order Id
  // special client order id:
  // starts with "autoclose-": liquidation order
  // "adl_autoclose": ADL auto close order
  S: OrderSide; // Side
  o: OrderType; // Order Type
  f: TimeInForce; // Time in Force
  q: string; // Original Quantity
  p: string; // Original Price
  ap: string; // Average Price
  sp: string; // Stop Price. Please ignore with TRAILING_STOP_MARKET order
  x: OrderExecutionType; // Execution Type
  X: OrderStatus; // Order Status
  i: number; // Order Id
  l: string; // Order Last Filled Quantity
  z: string; // Order Filled Accumulated Quantity
  L: string; // Last Filled Price
  N: string; // Commission Asset, will not push if no commission
  n: string; // Commission, will not push if no commission
  T: number; // Order Trade Time
  t: number; // Trade Id
  b: string; // Bids Notional
  a: string; // Ask Notional
  m: boolean; // Is this trade the maker side?
  R: boolean; // Is this reduce only
  wt: WorkingType; // Stop Price Working Type
  ot: OrderType; // Original Order Type
  ps: PositionSide; // Position Side
  cp: boolean; // If Close-All, pushed with conditional order
  AP: string; // Activation Price, only puhed with TRAILING_STOP_MARKET order
  cr: string; // Callback Rate, only puhed with TRAILING_STOP_MARKET order
  rp: string; // Realized Profit of the trade
}

export interface UserDataEventOrderUpdate {
  e: 'ORDER_TRADE_UPDATE'; // Event Type
  E: number; // Event Time
  T: number; // Transaction Time
  o: UserDataEventOrderUpdateData;
}

export interface UserDataEventAccountConfigUpdate {
  e: 'ACCOUNT_CONFIG_UPDATE'; // Event Type
  E: number; // Event Time
  T: number; // Transaction Time
  ac?: {
    s: string; // symbol
    l: number; // leverage
  }
  ai?: { // User's Account Configuration
    j: boolean; // Multi-Assets Mode
  }
}

export type UserDataEvent = UserDataEventExpired
| UserDataEventMarginCall
| UserDataEventAccountUpdate
| UserDataEventOrderUpdate
| UserDataEventAccountConfigUpdate;
