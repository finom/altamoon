import Persistent from './Persistent';
import Market from './Market';
import Account from './Account';
import Stats from './Stats';
import Trading from './Trading';
import Customization from './Customization';
export declare class RootStore {
    readonly persistent: Persistent;
    readonly market: Market;
    readonly account: Account;
    readonly stats: Stats;
    readonly customization: Customization;
    readonly trading: Trading;
    isSettingsModalOpen: boolean;
    constructor();
}
export declare type Foo = 'bar';
declare const store: RootStore;
declare global {
    type Store = RootStore;
}
export declare const ROOT: (rootStore: RootStore) => RootStore;
export declare const PERSISTENT: ({ persistent }: RootStore) => Persistent;
export declare const MARKET: ({ market }: RootStore) => Market;
export declare const ACCOUNT: ({ account }: RootStore) => Account;
export declare const TRADING: ({ trading }: RootStore) => Trading;
export declare const STATS: ({ stats }: RootStore) => Stats;
export declare const CUSTOMIZATION: ({ customization }: RootStore) => Customization;
export default store;
//# sourceMappingURL=index.d.ts.map