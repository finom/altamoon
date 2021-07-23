import * as api from '../api';
export default class Stats {
    #private;
    pnlPercent: number;
    pnlValue: number;
    dailyPnlPercent: number;
    dailyPnlValue: number;
    income: api.FuturesIncome[];
    dailyBNBCommissionSpent: number;
    constructor(store: Store);
}
//# sourceMappingURL=Stats.d.ts.map