import { FuturesLeverageResponse, FuturesPositionRisk, MarginType, FuturesAggTradeStreamTicker, FuturesAccount, FuturesLeverageBracket, FuturesUserTrades, FuturesDepth, FuturesExchangeInfo, IncomeType, FuturesIncome, TimeInForce, OrderType, OrderSide, FuturesOrder } from './types';
export declare function futuresLeverage(symbol: string, leverage: number): Promise<FuturesLeverageResponse>;
export declare function futuresMarginType(symbol: string, marginType: MarginType): Promise<void>;
export declare function futuresPositionRisk(): Promise<FuturesPositionRisk[]>;
export declare function futuresOpenOrders(symbol?: string): Promise<FuturesOrder[]>;
export declare function futuresPrices(): Promise<Record<string, string>>;
export declare function futuresLeverageBracket(symbol: string): Promise<{
    brackets: FuturesLeverageBracket[];
}[]>;
export declare function futuresGetDataStream(): Promise<{
    listenKey: string;
}>;
export declare function futuresAccount(): Promise<FuturesAccount>;
export declare function futuresUserTrades(symbol: string): Promise<FuturesUserTrades[]>;
export declare function futuresDepth(symbol: string): Promise<FuturesDepth>;
export declare function futuresExchangeInfo(): Promise<FuturesExchangeInfo>;
interface FuturesOrderOptions {
    side: OrderSide;
    symbol: string;
    quantity: number | string;
    price: number | string | null;
    stopPrice: number | string | null;
    type: OrderType;
    timeInForce?: TimeInForce;
    reduceOnly?: boolean;
}
export declare function futuresOrder({ side, symbol, quantity, price, stopPrice, type, timeInForce, reduceOnly, }: FuturesOrderOptions): Promise<FuturesOrder>;
export declare function futuresMarketOrder(side: OrderSide, symbol: string, quantity: number | string, { reduceOnly }?: {
    reduceOnly?: boolean;
}): Promise<FuturesOrder>;
export declare function futuresLimitOrder(side: OrderSide, symbol: string, quantity: number | string, price: number | string, { reduceOnly, timeInForce }?: {
    reduceOnly?: boolean;
    timeInForce?: TimeInForce;
}): Promise<FuturesOrder>;
export declare function futuresStopMarketOrder(side: OrderSide, symbol: string, quantity: number | string, stopPrice: number | string, { reduceOnly }?: {
    reduceOnly?: boolean;
}): Promise<FuturesOrder>;
export declare function futuresStopLimitOrder(side: OrderSide, symbol: string, quantity: number | string, price: number | string, stopPrice: number | string, { reduceOnly, timeInForce }?: {
    reduceOnly?: boolean;
    timeInForce?: TimeInForce;
}): Promise<FuturesOrder>;
export declare function futuresIncome(params: {
    symbol?: string;
    incomeType?: IncomeType;
    startTime?: number;
    endTime?: number;
    limit?: number;
    recvWindow?: number;
    timestamp?: number;
}): Promise<FuturesIncome[]>;
export declare function futuresCancel(symbol: string, orderId: number): Promise<FuturesOrder>;
export declare function futuresCancelAll(symbol: string): Promise<{
    msg: string;
    code: 200;
}>;
export declare function futuresAggTradeStream(givenSymbols: string | string[], callback: (ticker: FuturesAggTradeStreamTicker) => void): () => void;
export {};
//# sourceMappingURL=futures.d.ts.map