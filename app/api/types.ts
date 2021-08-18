export type PositionSide = 'BOTH' | 'LONG' | 'SHORT';
export type OrderSide = 'BUY' | 'SELL';
export type MarginType = 'ISOLATED' | 'CROSSED';
export type CandlestickChartInterval = '1m' | '3m' | '5m' | '15m' | '30m' | '1h' | '2h' | '4h' | '6h' | '8h' | '12h' | '1d' | '3d' | '1w' | '1M';
export type ContractType = 'PERPETUAL' | 'CURRENT_MONTH' | 'NEXT_MONTH' | 'CURRENT_MONTH_DELIVERING' | 'NEXT_MONTH_DELIVERING';
export type RateLimitInterval = 'MINUTE' | 'SECOND' | 'DAY';
export type OrderType = 'LIMIT' | 'MARKET' | 'STOP' | 'STOP_MARKET' | 'TAKE_PROFIT' | 'TAKE_PROFIT_MARKET' | 'TRAILING_STOP_MARKET';
export type RateLimiter = 'REQUEST_WEIGHT' | 'ORDERS';
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
  marginType: 'cross' | 'isolated';
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
  interval: CandlestickChartInterval;
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
}

export interface FuturesUserTrades {
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
  reduceOnly: false,
  side: OrderSide;
  positionSide: PositionSide;
  status: string;
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
