import { ChartAxis, ResizeData } from '../types';
import PriceLines from './PriceLines';
interface Params {
    axis: ChartAxis;
    alerts: number[];
    onUpdateAlerts: (d: number[]) => void;
}
export default class AlertPriceLines extends PriceLines {
    #private;
    constructor({ axis, alerts, onUpdateAlerts }: Params, resizeData: ResizeData);
    checkAlerts: (lastPrice: number) => void;
    updateAlertLines: (alerts: number[]) => void;
    update: (data?: Parameters<PriceLines['update']>[0] & {
        lastPrice?: number;
    }) => void;
}
export {};
//# sourceMappingURL=AlertPriceLines.d.ts.map