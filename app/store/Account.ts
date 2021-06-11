import { debounce } from 'lodash';
import { listenChange } from 'use-change';
import * as api from '../api';
import notify from '../lib/notify';
import stringifyError from '../lib/stringifyError';

export default class Account {
  public totalWalletBalance = 0;

  public totalPositionInitialMargin = 0;

  public totalOpenOrderInitialMargin = 0;

  public availableBalance = 0;

  public futuresAccount: api.FuturesAccount | null = null;

  public futuresAccountError: string | null = null;

  #store: Store;

  constructor(store: Store) {
    this.#store = store;
    const setBinanceOptions = async () => {
      const { binanceApiKey, binanceApiSecret } = store.persistent;
      if (binanceApiKey && binanceApiSecret) {
        api.setOptions({
          apiKey: binanceApiKey,
          apiSecret: binanceApiSecret,
        });
      }
      void this.#openStream();
      await this.reloadFuturesAccount();
    };

    const relaodApp = debounce(() => window.location.reload());

    listenChange(store.persistent, 'binanceApiKey', relaodApp);
    listenChange(store.persistent, 'binanceApiSecret', relaodApp);

    void setBinanceOptions();
  }

  public readonly reloadFuturesAccount = async (): Promise<void> => {
    try {
      const futuresAccount = await api.futuresAccount();
      this.futuresAccount = futuresAccount;
      this.futuresAccountError = null;
      this.totalWalletBalance = +futuresAccount.totalWalletBalance;
      this.totalPositionInitialMargin = +futuresAccount.totalPositionInitialMargin;
      this.totalOpenOrderInitialMargin = +futuresAccount.totalOpenOrderInitialMargin;
      this.availableBalance = +futuresAccount.availableBalance;
    } catch (e) {
      this.futuresAccountError = stringifyError(e);
    }
  };

  #openStream = async (): Promise<void> => {
    try {
      const { listenKey } = await api.futuresGetDataStream();

      const stream = new WebSocket(`wss://fstream.binance.com/ws/${listenKey}`);

      stream.onmessage = ({ data }) => {
        try {
          const { e } = JSON.parse(data) as { e: string };
          if (e === 'ACCOUNT_UPDATE') {
            void this.#store.trading.loadPositions();
            void this.#store.account.reloadFuturesAccount();
          }
        } catch (e) {
          notify('error', e);
        }
      };

      stream.onerror = () => notify('error', 'Account stream error');
    } catch {
      //
    }
  };
}
