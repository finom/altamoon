declare module 'node-binance-api' {
  // see https://binance-docs.github.io/apidocs/futures/en/#public-endpoints-info
  export type IncomeType = 'TRANSFER' | 'WELCOME_BONUS' | 'REALIZED_PNL' | 'FUNDING_FEE' | 'COMMISSION' | 'INSURANCE_CLEAR';

  export type ContractType = 'PERPETUAL' | 'CURRENT_MONTH' | 'NEXT_MONTH' | 'CURRENT_MONTH_DELIVERING' | 'NEXT_MONTH_DELIVERING';

  export type ContractStatus = 'PENDING_TRADING' | 'TRADING' | 'PRE_DELIVERING' | 'DELIVERING' | 'DELIVERED' | 'PRE_SETTLE' | 'SETTLING' | 'CLOSE';

  export type OrderStatus = 'NEW' | 'PARTIALLY_FILLED' | 'FILLED' | 'CANCELED' | 'REJECTED' | 'EXPIRED';

  export type OrderType = 'LIMIT' | 'MARKET' | 'STOP' | 'STOP_MARKET' | 'TAKE_PROFIT' | 'TAKE_PROFIT_MARKET' | 'TRAILING_STOP_MARKET';

  export type PositionSide = 'BOTH' | 'LONG' | 'SHORT';

  export type OrderSide = 'BUY' | 'SELL';

  export type MarginType = 'ISOLATED' | 'CROSSED';

  export type TimeInForce = 'GTC' | 'IOC' | 'FOK' | 'GTX';

  export type WorkingType = 'MARK_PRICE' | 'CONTRACT_PRICE';

  export type CandlestickChartInterval = '1m' | '3m' | '5m' | '15m' | '30m' | '1h' | '2h' | '4h' | '6h' | '8h' | '12h' | '1d' | '3d' | '1w' | '1M';

  export type RateLimiter = 'REQUEST_WEIGHT' | 'ORDERS';

  export type RateLimitInterval = 'MINUTE' | 'SECOND' | 'DAY';

  type Params = Record<string, number | string>;

  interface Options {
    APIKEY: string;
    APISECRET: string;
    useServerTime: boolean;
    recvWindow: number;
    verbose: boolean;
    log: (msg: string) => void;
  }

  export interface Depth {
    bids: Record<string, string>;
    asks: Record<string, string>;
  }

  export interface BalanceItem {
    available: string;
    onOrder: string;
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

  export interface FuturesChartCandle {
    close: string;
    closeTime: number;
    high: string;
    low: string;
    open: string;
    quoteVolume: string;
    takerBuyBaseVolume: string;
    takerBuyQuoteVolume: string;
    time: number;
    trades: number;
    volume: string;
  }

  export interface FuturesLeverageBracket {
    bracket: number;
    cum: number;
    initialLeverage: number;
    maintMarginRatio: number;
    notionalCap: number;
    notionalFloor: number;
  }

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
  export default class Binance {
    // GENERAL & SPOT API
    options: (options: Partial<Options>) => void;

    promiseRequest: <T = unknown>(
      url: string, data?: Record<string, string>, flags?: Record<string, string>,
    ) => Promise<T>;

    signedRequest: <T = unknown, E = unknown>(
      url: string,
      data?: any, // eslint-disable-line @typescript-eslint/no-explicit-any
      callback?: (error: E | null, resp: T | null) => void,
      method?: string,
      noDataInSignature?: boolean
    ) => void | Promise<T>;

    prices: (...args: unknown[]) => unknown;

    balance: () => Promise<Record<string, BalanceItem>>;

    bookTickers: (
      symbolOrCallback?: string | ((ticker: unknown) => void),
      callback?: (ticker: unknown) => void
    ) => void;

    depth: (
      symbol: string,
      callback?: (depth: Depth) => void,
      limit?: number,
    ) => void | Promise<Depth>;

    buy: (
      symbol: string,
      quantity: number,
      price: number,
      flags?: Record<string, string>,
      callback?: (...args: unknown[]) => unknown
    ) => void | Promise<unknown>;

    sell: (
      symbol: string,
      quantity: number,
      price: number,
      flags?: Record<string, string>,
      callback?: (...args: unknown[]) => unknown
    ) => void | Promise<unknown>;

    marketBuy: (
      symbol: string,
      quantity: number,
      flags?: Record<string, string>,
      callback?: (...args: unknown[]) => unknown
    ) => void | Promise<unknown>;

    marketSell: (
      symbol: string,
      quantity: number,
      flags?: Record<string, string>,
      callback?: (...args: unknown[]) => unknown
    ) => void | Promise<unknown>;

    cancel: (...args: unknown[]) => unknown;

    cancelAll: (...args: unknown[]) => unknown;

    openOrders: (...args: unknown[]) => unknown;

    orderStatus: (...args: unknown[]) => unknown;

    trades: (...args: unknown[]) => unknown;

    allOrders: (...args: unknown[]) => unknown;

    dustLog: (...args: unknown[]) => unknown;

    prevDay: (...args: unknown[]) => unknown;

    candlesticks: (...args: unknown[]) => unknown;

    websockets: {
      depth: (...args: unknown[]) => unknown;
      depthCache: (...args: unknown[]) => unknown;
      chart: (...args: unknown[]) => unknown;
      candlesticks: (...args: unknown[]) => unknown;
      trades: (...args: unknown[]) => unknown;
      miniTicker: (...args: unknown[]) => unknown;
      prevDay: (...args: unknown[]) => unknown;
    };

    sortBids: (...args: unknown[]) => unknown;

    sortAsks: (...args: unknown[]) => unknown;

    first: (...args: unknown[]) => unknown;

    depositAddress: (...args: unknown[]) => unknown;

    depositHistory: (...args: unknown[]) => unknown;

    withdrawHistory: (...args: unknown[]) => unknown;

    withdraw: (...args: unknown[]) => unknown;

    // MARGIN API

    mgTransferMainToMargin: (...args: unknown[]) => unknown;

    mgTransferMarginToMain: (...args: unknown[]) => unknown;

    maxTransferable: (...args: unknown[]) => unknown;

    maxBorrowable: (...args: unknown[]) => unknown;

    mgBorrow: (...args: unknown[]) => unknown;

    mgRepay: (...args: unknown[]) => unknown;

    mgAccount: (...args: unknown[]) => unknown;

    // LENDING API

    lending: (...args: unknown[]) => unknown;

    // FUTURES API

    futuresPrices: (...args: unknown[]) => unknown;

    futuresAccount: (params?: Params) => Promise<FuturesAccount>;

    futuresBalance: (...args: unknown[]) => unknown;

    futuresBuy: (symbol: string, quantity: number, price: number) => unknown;

    futuresSell: (symbol: string, quantity: number, price: number) => unknown;

    futuresMarketBuy: (symbol: string, quantity: number) => unknown;

    futuresMarketSell: (symbol: string, quantity: number) => unknown;

    futuresPositionRisk: (params?: Params) => Promise<FuturesPositionRisk[]>;

    futuresLeverage: (symbol: string, leverage: number, params?: Params) => Promise<{
      leverage: number;
      maxNotionalValue: string;
      symbol: string;
    }>;

    futuresMarginType: (symbol: string, marginType: MarginType) => Promise<unknown>;

    futuresPositionMargin: (symbol: string, amount: number, type: string) => unknown;

    futuresTime: (...args: unknown[]) => unknown;

    futuresExchangeInfo: () => Promise<FuturesExchangeInfo>;

    futuresCandles: (symbol: string, interval?: string) => unknown;

    futuresDepth: (symbol: string) => Promise<FuturesDepth>;

    futuresQuote: (symbol?: string) => unknown;

    futuresDaily: (...args: unknown[]) => unknown;

    futuresOpenInterest: (symbol: string) => unknown;

    futuresMarkPrice: (symbol?: string) => unknown;

    futuresTrades: (symbol: string) => unknown;

    futuresAggTrades: (symbol: string) => unknown;

    futuresLiquidationOrders: (...args: unknown[]) => unknown;

    futuresFundingRate: (...args: unknown[]) => unknown;

    futuresHistoricalTrades: (symbol: string) => unknown;

    futuresLeverageBracket: (
      symbol: string, params?: Params,
    ) => Promise<{ brackets: FuturesLeverageBracket[] }[]>;

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

    futuresGetDataStream: () => Promise<{ listenKey: string; }>;

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
      interval: CandlestickChartInterval,
      callback: (
        symbol: string,
        interval: CandlestickChartInterval,
        futuresKlineConcat: Record<number, FuturesChartCandle>,
      ) => void,
      limit?: number
    ) => Promise<string>;

    futuresSubscribe: <T = unknown>(
      streams: string | string[],
      callback: (data: T) => void,
      params?: { params?: boolean, openCallback?: (e: unknown) => void; }
    ) => void;

    futuresTerminate: (endpoint: string, reconnect?: boolean) => unknown;

    futuresSubscriptions: (...args: unknown[]) => unknown;

    // DELIVERY API

    deliveryBuy: (...args: unknown[]) => unknown;

    deliverySell: (...args: unknown[]) => unknown;

    deliveryMarketBuy: (...args: unknown[]) => unknown;

    deliveryMarketSell: (...args: unknown[]) => unknown;

    deliveryPrices: (...args: unknown[]) => unknown;

    deliveryDaily: (...args: unknown[]) => unknown;

    deliveryOpenInterest: (...args: unknown[]) => unknown;

    deliveryExchangeInfo: (...args: unknown[]) => unknown;

    deliveryOpenOrders: (...args: unknown[]) => unknown;

    deliveryAllOrders: (...args: unknown[]) => unknown;

    deliveryCandles: (...args: unknown[]) => unknown;

    deliveryIndexKlines: (...args: unknown[]) => unknown;

    deliveryContinuousKlines: (...args: unknown[]) => unknown;

    deliveryMarkPriceKlines: (...args: unknown[]) => unknown;

    deliveryMarkPrice: (...args: unknown[]) => unknown;

    deliveryHistoricalTrades: (...args: unknown[]) => unknown;

    deliveryTrades: (...args: unknown[]) => unknown;

    deliveryAggTrades: (...args: unknown[]) => unknown;

    deliveryUserTrades: (...args: unknown[]) => unknown;

    deliveryLiquidationOrders: (...args: unknown[]) => unknown;

    deliveryPositionRisk: (...args: unknown[]) => unknown;

    deliveryLeverage: (...args: unknown[]) => unknown;

    deliveryMarginType: (...args: unknown[]) => unknown;

    deliveryPositionMargin: (...args: unknown[]) => unknown;

    deliveryPositionMarginHistory: (...args: unknown[]) => unknown;

    deliveryIncome: (...args: unknown[]) => unknown;

    deliveryBalance: (...args: unknown[]) => unknown;

    deliveryAccount: (...args: unknown[]) => unknown;

    deliveryDepth: (...args: unknown[]) => unknown;

    deliveryQuote: (...args: unknown[]) => unknown;

    deliveryLeverageBracket: (...args: unknown[]) => unknown;

    deliveryOrderStatus: (...args: unknown[]) => unknown;

    deliveryCancel: (...args: unknown[]) => unknown;

    deliveryCancelAll: (...args: unknown[]) => unknown;

    deliveryCountdownCancelAll: (...args: unknown[]) => unknown;

    deliveryOrder: (...args: unknown[]) => unknown;

    deliveryGetDataStream: (...args: unknown[]) => unknown;

    deliveryCloseDataStream: (...args: unknown[]) => unknown;

    deliveryKeepDataStream: (...args: unknown[]) => unknown;

    deliveryPing: (...args: unknown[]) => unknown;

    deliveryTime: (...args: unknown[]) => unknown;
  }
}
