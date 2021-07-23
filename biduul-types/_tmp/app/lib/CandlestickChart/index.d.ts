import * as api from '../../api';
import './chart.global.css';
import { PriceLinesDatum } from './types';
import { TradingOrder, TradingPosition } from '../../store/types';
import { OrderSide } from '../../api';
interface Params {
    onUpdateAlerts: (d: number[]) => void;
    onUpdateDrafts: (d: {
        buyDraftPrice: number | null;
        sellDraftPrice: number | null;
        stopBuyDraftPrice: number | null;
        stopSellDraftPrice: number | null;
    }) => void;
    onClickDraftCheck: (d: {
        buyDraftPrice: number | null;
        sellDraftPrice: number | null;
        stopBuyDraftPrice: number | null;
        stopSellDraftPrice: number | null;
    }, side: OrderSide) => void;
    onDragLimitOrder: (orderId: number, price: number) => void;
    onCancelOrder: (orderId: number) => void;
    alerts: number[];
    draftPriceItems: PriceLinesDatum[];
    pricePrecision: number;
}
export default class CandlestickChart {
    #private;
    constructor(container: string | Node | HTMLElement | HTMLElement[] | Node[], { pricePrecision, alerts, onUpdateAlerts, onUpdateDrafts, onClickDraftCheck, onDragLimitOrder, onCancelOrder, }: Params);
    /**
     * The method updates chart properties but not chart data
     * @param properties - New chart properties
     */
    update(data: {
        pricePrecision?: number;
        candles?: api.FuturesChartCandle[];
        position?: TradingPosition | null;
        orders?: TradingOrder[];
        alerts?: number[];
        buyDraftPrice?: number | null;
        sellDraftPrice?: number | null;
        shouldShowBuyPrice?: boolean;
        shouldShowSellPrice?: boolean;
        stopBuyDraftPrice?: number | null;
        stopSellDraftPrice?: number | null;
        shouldShowStopBuyPrice?: boolean;
        shouldShowStopSellPrice?: boolean;
        canCreateDraftLines?: boolean;
    }): void;
    /**
     * Removes SVG
     */
    unmount(): void;
    resetAlerts: () => void;
}
export {};
//# sourceMappingURL=index.d.ts.map