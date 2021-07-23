import * as api from '../api';
export declare type Api = typeof api;
export declare type Plugin<T> = (store: T, api: Api) => void;
export interface TradingPosition {
    entryPrice: number;
    positionAmt: number;
    initialAmt: number;
    liquidationPrice: number;
    lastPrice: number;
    isolatedMargin: number;
    isolatedWallet: number;
    symbol: string;
    baseValue: number;
    side: api.OrderSide;
    pnl: number;
    pnlPositionPercent: number;
    pnlBalancePercent: number;
    leverage: number;
    marginType: api.FuturesPositionRisk['marginType'];
    baseAsset: string;
}
export interface TradingOrder {
    clientOrderId: string;
    cumQuote: string;
    executedQty: number;
    orderId: number;
    avgPrice: number;
    origQty: number;
    price: number;
    lastPrice: number;
    reduceOnly: false;
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
}
declare global {
    interface Window {
        biduulPlugin: <T = Store>(plugin: Plugin<T>) => void;
    }
}
//# sourceMappingURL=types.d.ts.map