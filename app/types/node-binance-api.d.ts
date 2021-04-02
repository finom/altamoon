declare module 'node-binance-api' {
  // see https://binance-docs.github.io/apidocs/futures/en/#public-endpoints-info
  export type IncomeType = 'TRANSFER' | 'WELCOME_BONUS' | 'REALIZED_PNL' | 'FUNDING_FEE' | 'COMMISSION' | 'INSURANCE_CLEAR';

  export type ContractType = 'PERPETUAL' | 'CURRENT_MONTH' | 'NEXT_MONTH' | 'CURRENT_MONTH_DELIVERING' | 'NEXT_MONTH_DELIVERING';

  export type ContractStatus = 'PENDING_TRADING' | 'TRADING' | 'PRE_DELIVERING' | 'DELIVERING' | 'DELIVERED' | 'PRE_SETTLE' | 'SETTLING' | 'CLOSE';

  export type OrderStatus = 'NEW' | 'PARTIALLY_FILLED' | 'FILLED' | 'CANCELED' | 'REJECTED' | 'EXPIRED';

  export type OrderType = 'LIMIT' | 'MARKET' | 'STOP' | 'STOP_MARKET' | 'TAKE_PROFIT' | 'TAKE_PROFIT_MARKET' | 'TRAILING_STOP_MARKET';

  export type PositionSide = 'BOTH' | 'LONG' | 'SHORT';

  export type OrderSide = 'BUY' | 'SELL';

  export type TimeInForce = 'GTC' | 'IOC' | 'FOK' | 'GTX';

  export type WorkingType = 'MARK_PRICE' | 'CONTRACT_PRICE';

  export type CandlestickChartIntervals = '1m' | '3m' | '5m' | '15m' | '30m' | '1h' | '2h' | '4h' | '6h' | '8h' | '12h' | '1d' | '3d' | '1w' | '1M';

  export type RateLimiter = 'REQUEST_WEIGHT' | 'ORDERS';

  export type RateLimitInterval = 'MINUTE' | 'SECOND' | 'DAY';

  interface Options {
    APIKEY: string;
    APISECRET: string;
    useServerTime: boolean;
    recvWindow: number;
    verbose: boolean;
    log: (msg: string) => void;
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

  interface FuturesExchangeInfoSymbol {
    baseAsset: string;
    baseAssetPrecision: number;
    contractType: ContractType;
    deliveryDate: number;
    filters: ({ filterType: string } & Record<string, number | string>)[];
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

  export interface FuturesDepth {
    E: number;
    T: number;
    asks: [string, string][];
    bids: [string, string][];
    lastUpdateId: number;
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

  export default class Binance {
    options: (options: Partial<Options>) => void;

    futuresPrices: () => unknown;

    futuresAccount: () => Promise<FuturesAccount>;

    futuresBalance: () => unknown;

    futuresBuy: (symbol: string, quantity: number, price: number) => unknown;

    futuresSell: (symbol: string, quantity: number, price: number) => unknown;

    futuresMarketBuy: (symbol: string, quantity: number) => unknown;

    futuresMarketSell: (symbol: string, quantity: number) => unknown;

    futuresPositionRisk: () => unknown;

    futuresLeverage: (symbol: string, leverage: number) => unknown;

    futuresMarginType: (symbol: string, marginType: string) => unknown;

    futuresPositionMargin: (symbol: string, amount: number, type: string) => unknown;

    futuresTime: () => unknown;

    futuresExchangeInfo: () => Promise<FuturesExchangeInfo>;

    futuresCandles: (symbol: string, interval?: string) => unknown;

    futuresDepth: (symbol: string) => Promise<FuturesDepth>;

    futuresQuote: (symbol?: string) => unknown;

    futuresDaily: () => unknown;

    futuresOpenInterest: (symbol: string) => unknown;

    futuresMarkPrice: (symbol?: string) => unknown;

    futuresTrades: (symbol: string) => unknown;

    futuresAggTrades: (symbol: string) => unknown;

    futuresLiquidationOrders: () => unknown;

    futuresFundingRate: () => unknown;

    futuresHistoricalTrades: (symbol: string) => unknown;

    futuresLeverageBracket: (symbol: string) => unknown;

    futuresIncome: (params: {
      symbol?: string;
      incomeType?: IncomeType;
      startTime?: number;
      endTime?: number;
      limit?: number;
      recvWindow?: number;
      timestamp?: number;
    }) => Promise<FuturesIncome[]>;

    futuresCancelAll: (symbol: string) => unknown;

    futuresCancel: (symbol: string, params: { orderId: string }) => unknown;

    futuresCountdownCancelAll: (symbol: string, countdownTime: number) => unknown;

    futuresOrderStatus: (symbol: string, params: { orderId: string }) => unknown;

    futuresOpenOrders: (symbol?: string) => unknown;

    futuresAllOrders: (symbol?: string) => unknown;

    futuresUserTrades: (symbol: string) => Promise<FuturesUserTrades[]>;

    futuresGetDataStream: () => unknown;

    futuresPositionMarginHistory: (symbol: string) => unknown;

    futuresHistDataId: (
      symbol?: string, params?: { startTime?: number; endTime?: number; dataType?: string }
    ) => unknown;

    futuresDownloadLink: (downloadId: number) => unknown;

    futuresMiniTickerStream: (
      symbolOrCallback: string | ((ticker: unknown) => void), callback?: (ticker: unknown) => void
    ) => string;

    futuresBookTickerStream: (
      symbolOrCallback: string | ((ticker: unknown) => void), callback?: (ticker: unknown) => void
    ) => string;

    futuresTickerStream: (
      symbolOrCallback: string | ((ticker: unknown) => void), callback?: (ticker: unknown) => void
    ) => string;

    futuresMarkPriceStream: (
      symbolOrCallback: string | ((ticker: unknown) => void), callback?: (ticker: unknown) => void
    ) => string;

    futuresAggTradeStream: (
      symbolOrCallback: string | ((ticker: FuturesAggTradeStreamTicker) => void),
      callback?: (ticker: FuturesAggTradeStreamTicker) => void,
    ) => string;

    futuresLiquidationStream: (
      symbolOrCallback: string | ((ticker: unknown) => void), callback?: (ticker: unknown) => void
    ) => string;

    futuresChart: (
      symbols: string | string[],
      interval: string,
      callback: (symbol: string, interval: string, futuresKlineConcat: unknown) => void,
      limit: number
    ) => unknown;

    futuresSubscribe: <T = unknown>(
      streams: string | string[],
      callback: (data: T) => void,
      params?: { params?: boolean, openCallback?: (e: unknown) => void; }
    ) => void;

    futuresTerminate: (endpoint: string, reconnect?: boolean) => unknown;

    promiseRequest: (
      url: string, data?: Record<string, string>, flags?: Record<string, string>,
    ) => unknown;
  }
}
