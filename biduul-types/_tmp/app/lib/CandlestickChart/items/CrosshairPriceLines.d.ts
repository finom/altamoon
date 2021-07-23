import { ChartAxis, ResizeData } from '../types';
import PriceLines from './PriceLines';
interface Params {
    axis: ChartAxis;
}
export default class CrosshairPriceLines extends PriceLines {
    constructor({ axis }: Params, resizeData: ResizeData);
    show: (x: number, y: number) => void;
    hide: () => void;
}
export {};
//# sourceMappingURL=CrosshairPriceLines.d.ts.map