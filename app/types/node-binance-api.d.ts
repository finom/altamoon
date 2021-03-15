declare module 'node-binance-api' {
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
    contractType: string;
    deliveryDate: number;
    filters: ({ filterType: string } & Record<string, number | string>)[];
    maintMarginPercent: string;
    marginAsset: string;
    onboardDate: number;
    orderTypes: string[];
    pair: string;
    pricePrecision: number;
    quantityPrecision: number;
    quoteAsset: string;
    quotePrecision: number;
    requiredMarginPercent: string;
    settlePlan: number;
    status: string;
    symbol: string;
    timeInForce: string[];
    triggerProtect: string;
    underlyingSubType: unknown[]
    underlyingType: string;
  }
  export interface FuturesExchangeInfo {
    exchangeFilters: unknown[];
    futuresType: string;
    rateLimits: {
      interval: string;
      intervalNum: number;
      limit: number;
      rateLimitType: string;
    }[]
    serverTime: number;
    symbols: FuturesExchangeInfoSymbol[]
    timezone: string;
  }

  export default class Binance {
    options: (options: Partial<Options>) => void;

    futuresPrices: () => unknown;

    futuresAccount: () => unknown;

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

    futuresExchangeInfo : () => Promise<FuturesExchangeInfo>;

    futuresCandles : (symbol: string, interval?: string) => unknown;

    futuresDepth : (symbol: string) => unknown;

    futuresQuote : (symbol?: string) => unknown;

    futuresDaily : () => unknown;

    futuresOpenInterest : (symbol: string) => unknown;

    futuresMarkPrice : (symbol?: string) => unknown;

    futuresTrades : (symbol: string) => unknown;

    futuresAggTrades : (symbol: string) => unknown;

    futuresLiquidationOrders : () => unknown;

    futuresFundingRate : () => unknown;

    futuresHistoricalTrades : (symbol: string) => unknown;

    futuresLeverageBracket : (symbol: string) => unknown;

    futuresIncome : () => unknown;

    futuresCancelAll : (symbol: string) => unknown;

    futuresCancel : (symbol: string, params: { orderId: string }) => unknown;

    futuresCountdownCancelAll : (symbol: string, countdownTime: number) => unknown;

    futuresOrderStatus : (symbol: string, params: { orderId: string }) => unknown;

    futuresOpenOrders : (symbol?: string) => unknown;

    futuresAllOrders : (symbol?: string) => unknown;

    futuresUserTrades : (symbol: string) => unknown;

    futuresGetDataStream : () => unknown;

    futuresPositionMarginHistory : (symbol: string) => unknown;

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

    futuresSubscribe: (
      streams: string | string[],
      callback: (data: unknown) => void,
      params?: { params?: boolean, openCallback?: (e: unknown) => void; }
    ) => unknown;

    futuresTerminate: (endpoint: string, reconnect: boolean) => unknown;

    promiseRequest : (
      url: string, data?: Record<string, string>, flags?: Record<string, string>,
    ) => unknown;
  }
}
