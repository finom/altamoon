import * as api from '../api';
export default class Account {
    #private;
    totalWalletBalance: number;
    totalPositionInitialMargin: number;
    totalOpenOrderInitialMargin: number;
    availableBalance: number;
    futuresAccount: api.FuturesAccount | null;
    futuresAccountError: string | null;
    constructor(store: Store);
    readonly reloadFuturesAccount: import("lodash").DebouncedFunc<() => Promise<void>>;
}
//# sourceMappingURL=Account.d.ts.map