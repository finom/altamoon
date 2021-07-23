import * as api from '../api';
import { OrderSide } from '../api';
import { TradingOrder, TradingPosition } from './types';
export default class Trading {
    #private;
    openPositions: TradingPosition[];
    allSymbolsPositionRisk: Record<string, api.FuturesPositionRisk>;
    openOrders: TradingOrder[];
    currentSymbolMaxLeverage: number;
    currentSymbolLeverage: number;
    isCurrentSymbolMarginTypeIsolated: boolean | null;
    positionsKey?: string;
    limitBuyPrice: number | null;
    shouldShowLimitBuyPriceLine: boolean;
    limitSellPrice: number | null;
    shouldShowLimitSellPriceLine: boolean;
    stopBuyPrice: number | null;
    shouldShowStopBuyPriceLine: boolean;
    stopSellPrice: number | null;
    shouldShowStopSellPriceLine: boolean;
    exactSizeLimitBuyStr: string;
    exactSizeLimitSellStr: string;
    exactSizeStopLimitBuyStr: string;
    exactSizeStopLimitSellStr: string;
    constructor(store: Store);
    loadPositions: import("lodash").DebouncedFunc<() => Promise<void>>;
    loadOrders: import("lodash").DebouncedFunc<() => Promise<void>>;
    marketOrder: ({ side, quantity, symbol, reduceOnly, }: {
        side: api.OrderSide;
        quantity: number;
        symbol: string;
        reduceOnly?: boolean | undefined;
    }) => Promise<api.FuturesOrder | null>;
    limitOrder: ({ side, quantity, price, symbol, reduceOnly, postOnly, }: {
        side: api.OrderSide;
        quantity: number;
        price: number;
        symbol: string;
        reduceOnly?: boolean | undefined;
        postOnly?: boolean | undefined;
    }) => Promise<api.FuturesOrder | null>;
    stopMarketOrder: ({ side, quantity, symbol, stopPrice, reduceOnly, }: {
        side: api.OrderSide;
        quantity: number;
        symbol: string;
        stopPrice: number;
        reduceOnly?: boolean | undefined;
    }) => Promise<api.FuturesOrder | null>;
    stopLimitOrder: ({ side, quantity, price, stopPrice, symbol, reduceOnly, postOnly, }: {
        side: api.OrderSide;
        quantity: number;
        price: number;
        stopPrice: number;
        symbol: string;
        reduceOnly?: boolean | undefined;
        postOnly?: boolean | undefined;
    }) => Promise<api.FuturesOrder | null>;
    closePosition: (symbol: string, amt?: number | undefined) => Promise<api.FuturesOrder | null>;
    cancelOrder: (symbol: string, orderId: number) => Promise<api.FuturesOrder | null>;
    cancelAllOrders: (symbol: string) => Promise<void>;
    getFee: (qty: number, type?: 'maker' | 'taker') => number;
    updateDrafts: ({ buyDraftPrice, sellDraftPrice, stopBuyDraftPrice, stopSellDraftPrice, }: {
        buyDraftPrice: number | null;
        sellDraftPrice: number | null;
        stopBuyDraftPrice: number | null;
        stopSellDraftPrice: number | null;
    }) => void;
    createOrderFromDraft: ({ buyDraftPrice, sellDraftPrice, stopBuyDraftPrice, stopSellDraftPrice, }: {
        buyDraftPrice: number | null;
        sellDraftPrice: number | null;
        stopBuyDraftPrice: number | null;
        stopSellDraftPrice: number | null;
    }, side: OrderSide) => Promise<void>;
    calculateQuantity: ({ symbol, price, size, }: {
        symbol: string;
        price: number;
        size: number;
    }) => number;
    calculateSizeFromString: (sizeStr: string) => number;
}
//# sourceMappingURL=Trading.d.ts.map