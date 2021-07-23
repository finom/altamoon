import { Layout } from 'react-grid-layout';
import * as api from '../api';
export default class Persistent {
    symbol: string;
    interval: api.CandlestickChartInterval;
    theme: "dark" | "light";
    layout: Layout[];
    tradingType: api.OrderType;
    tradingPostOnly: boolean;
    tradingReduceOnly: boolean;
    binanceApiKey: string | null;
    binanceApiSecret: string | null;
    ignoreValuesBelowNumber: number;
    symbolAlerts: Record<string, number[]>;
    pluginsEnabled: string[];
    widgetsDisabled: string[];
    numberOfColumns: number;
    constructor();
}
//# sourceMappingURL=Persistent.d.ts.map