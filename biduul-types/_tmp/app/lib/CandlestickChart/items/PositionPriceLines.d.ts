import { TradingPosition } from '../../../store/types';
import { ChartAxis, ResizeData } from '../types';
import PriceLines from './PriceLines';
interface Params {
    axis: ChartAxis;
}
export default class PositionPriceLines extends PriceLines {
    constructor({ axis }: Params, resizeData: ResizeData);
    updatePositionLine: (position: TradingPosition | null) => void;
}
export {};
//# sourceMappingURL=PositionPriceLines.d.ts.map