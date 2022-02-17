import { MinichartsStore, minichartsStore } from 'altamoon-minicharts';
import { listenChange } from 'use-change';
import { groupBy } from 'lodash';
import * as api from '../api';

import convertType from '../lib/convertType';
import Persistent from './Persistent';
import Market from './Market';
import Account from './Account';
import Stats from './Stats';
import Trading from './Trading';
import Customization from './Customization';
import notify from '../lib/notify';
import './altamoon.d';

export class RootStore implements altamoon.RootStore {
  public readonly persistent: Persistent;

  public readonly market: Market;

  public readonly account: Account;

  public readonly stats: Stats;

  public readonly customization: Customization;

  public readonly trading: Trading;

  public readonly minicharts: MinichartsStore = minichartsStore;

  public isSettingsModalOpen;

  public readonly futuresAlertsWorkerSubscribe = api.futuresAlertsWorkerSubscribe;

  public readonly futuresChartWorkerSubscribe = api.futuresChartWorkerSubscribe;

  constructor() {
    this.persistent = new Persistent();
    this.account = new Account(this); // should be init before Market to set Binance options
    this.market = new Market(this);
    this.trading = new Trading(this);
    this.stats = new Stats(this);
    this.customization = new Customization(this);
    this.isSettingsModalOpen = !this.persistent.binanceApiKey
      && !(this.persistent.isTestnet
      && this.persistent.testnetBinanceApiKey);

    // update minichart orders
    listenChange(this.trading, 'openOrders', (openOrders, prevOpenOrders) => {
      for (const { symbol } of prevOpenOrders) {
        this.minicharts.allOrders[symbol] = null;
      }

      Object.assign(this.minicharts.allOrders, groupBy(openOrders, 'symbol'));
    });

    // update minichart positions
    listenChange(this.trading, 'openPositions', (openPositions, prevPositions) => {
      for (const { symbol } of prevPositions) {
        this.minicharts.allPositions[symbol] = null;
      }

      for (const position of openPositions) {
        this.minicharts.allPositions[position.symbol] = position;
      }

      this.minicharts.positionSymbols = openPositions.map(({ symbol }) => symbol);
    });

    // update minichart leverageBrackets (for liq. price calc.)
    listenChange(this.account, 'leverageBrackets', (leverageBrackets) => {
      Object.assign(this.minicharts.allLeverageBrackets, leverageBrackets);
    });

    // binance-api-error is triggered by api.promiseRequest
    window.addEventListener('binance-api-error', (evt) => {
      const { detail } = evt as CustomEvent<{ error: string | Error }>;
      notify('error', detail.error);
    });
  }
}

const store = new RootStore();

convertType<{ altamoonStore: RootStore }>(window).altamoonStore = store;

// store selectors
export const ROOT = (root: RootStore): RootStore => root;
export const PERSISTENT = ({ persistent }: RootStore): Persistent => persistent;
export const MARKET = ({ market }: RootStore): Market => market;
export const ACCOUNT = ({ account }: RootStore): Account => account;
export const TRADING = ({ trading }: RootStore): Trading => trading;
export const STATS = ({ stats }: RootStore): Stats => stats;
export const CUSTOMIZATION = ({ customization }: RootStore): Customization => customization;
export const MINICHARTS = ({ minicharts }: RootStore): MinichartsStore => minicharts;

export default store;
