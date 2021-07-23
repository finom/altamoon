import * as api from '../api';
export default class Market {
    #private;
    lastTrades: api.FuturesAggTradeStreamTicker[];
    lastTrade: api.FuturesAggTradeStreamTicker | null;
    currentSymbolLastPrice: number | null;
    futuresExchangeSymbols: Record<string, api.FuturesExchangeInfoSymbol>;
    currentSymbolInfo: api.FuturesExchangeInfoSymbol | null;
    currentSymbolPricePrecision: number;
    currentSymbolBaseAsset: string | null;
    asks: [number, number][];
    bids: [number, number][];
    candles: api.FuturesChartCandle[];
    constructor(store: Store);
}
//# sourceMappingURL=Market.d.ts.map