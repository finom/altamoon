import { TradingOrder } from '../../../store/types';
import { ChartAxis, ResizeData } from '../types';
import PriceLines from './PriceLines';
interface Params {
    axis: ChartAxis;
    onDragLimitOrder: (orderId: number, price: number) => void;
    onCancelOrder: (orderId: number) => void;
}
export default class OrderPriceLines extends PriceLines {
    constructor({ axis, onDragLimitOrder, onCancelOrder }: Params, resizeData: ResizeData);
    updateOrderLines(orders: TradingOrder[]): void;
}
export {};
//# sourceMappingURL=OrderPriceLines.d.ts.map