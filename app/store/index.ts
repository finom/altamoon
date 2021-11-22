import convertType from '../lib/convertType';

import Persistent from './Persistent';
import Market from './Market';
import Account from './Account';
import Stats from './Stats';
import Trading from './Trading';
import Customization from './Customization';
import notify from '../lib/notify';

export class RootStore {
  public readonly persistent: Persistent;

  public readonly market: Market;

  public readonly account: Account;

  public readonly stats: Stats;

  public readonly customization: Customization;

  public readonly trading: Trading;

  public isSettingsModalOpen;

  constructor() {
    this.persistent = new Persistent();
    this.account = new Account(this); // should be init before Market to set Binance options
    this.market = new Market(this);
    this.trading = new Trading(this);
    this.stats = new Stats(this);
    this.customization = new Customization(this);
    this.isSettingsModalOpen = !this.persistent.binanceApiKey;

    window.addEventListener('binance-api-error', (evt) => {
      const { detail } = evt as CustomEvent<{ error: string | Error }>;
      notify('error', detail.error);
    });
  }
}

const store = new RootStore();

if (process.env.NODE_ENV === 'development') {
  // make store to be accessed ass a global variable
  convertType<{ store: RootStore }>(window).store = store;
}

// allow to use it at class members
declare global { type Store = RootStore; }

// store selectors
export const ROOT = (root: RootStore): RootStore => root;
export const PERSISTENT = ({ persistent }: RootStore): Persistent => persistent;
export const MARKET = ({ market }: RootStore): Market => market;
export const ACCOUNT = ({ account }: RootStore): Account => account;
export const TRADING = ({ trading }: RootStore): Trading => trading;
export const STATS = ({ stats }: RootStore): Stats => stats;
export const CUSTOMIZATION = ({ customization }: RootStore): Customization => customization;

export default store;
