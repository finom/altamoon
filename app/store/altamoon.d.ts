declare namespace altamoon {
  type Persistent = import('./Persistent').default;
  type Market = import('./Market').default;
  type Account = import('./Account').default;
  type Stats = import('./Stats').default;
  type Customization = import('./Customization').default;
  type Trading = import('./Trading').default;

  class RootStore {
    readonly persistent: Persistent;

    readonly market: Market;

    readonly account: Account;

    readonly stats: Stats;

    readonly customization: Customization;

    readonly trading: Trading;

    isSettingsModalOpen: boolean;

    constructor();
  }
}
