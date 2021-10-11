import { debounce, throttle } from 'lodash';
import { listenChange } from 'use-change';

import * as api from '../api';
import notify from '../lib/notify';
import delay from '../lib/delay';
import stringifyError from '../lib/stringifyError';

export default class Account {
  public totalWalletBalance = 0;

  public totalPositionInitialMargin = 0;

  public totalOpenOrderInitialMargin = 0;

  public availableBalance = 0;

  public futuresAccount: api.FuturesAccount | null = null;

  public futuresAccountError: string | null = null;

  public leverageBrackets: Record<string, api.FuturesLeverageBracket[]> = {};

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

        void this.#openStream();

        await this.reloadFuturesAccount();

        const leverageBrackets: Account['leverageBrackets'] = {};

        for (const { symbol, brackets } of await api.futuresLeverageBracket()) {
          leverageBrackets[symbol] = brackets;
        }

        this.leverageBrackets = leverageBrackets;
      }
    };

    const relaodApp = debounce(() => window.location.reload());

    listenChange(store.persistent, 'binanceApiKey', relaodApp);
    listenChange(store.persistent, 'binanceApiSecret', relaodApp);

    void setBinanceOptions();
  }

  public readonly reloadFuturesAccount = throttle(async (): Promise<void> => {
    if (!this.#store.persistent.binanceApiKey || !this.#store.persistent.binanceApiSecret) {
      await delay(3000);
      return this.reloadFuturesAccount();
    }
    try {
      const futuresAccount = await api.futuresAccount();
      this.futuresAccount = futuresAccount;

      this.futuresAccountError = null;
      this.totalWalletBalance = +futuresAccount.totalWalletBalance;

      this.totalPositionInitialMargin = +futuresAccount.totalPositionInitialMargin;
      this.totalOpenOrderInitialMargin = +futuresAccount.totalOpenOrderInitialMargin;
      this.availableBalance = +futuresAccount.availableBalance;
      return undefined;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      this.futuresAccountError = `${stringifyError(e)} Retrying...`;
      await delay(3000);
      return this.reloadFuturesAccount();
    }
  }, 500);

  #openStream = async (): Promise<void> => {
    const reconnect = async (errorOrEvent: Error | Event, notifyMessage: string) => {
      notify('error', notifyMessage);
      // eslint-disable-next-line no-console
      console.error(errorOrEvent);
      await delay(3000);
      // eslint-disable-next-line no-console
      console.info('Reconnecting...');
      return this.#openStream();
    };

    try {
      const { listenKey } = await api.futuresGetDataStream();

      // eslint-disable-next-line no-console
      console.info('listenKey is received, establishing a new account stream connection...');

      const stream = new WebSocket(`wss://fstream.binance.com/ws/${listenKey}`);

      stream.onmessage = ({ data: messageData }) => {
        try {
          const data = JSON.parse(messageData) as api.UserDataEvent;
          const { e: event, E: updateTime } = data;

          // eslint-disable-next-line no-console
          console.info('Received data stream message', event);

          if (event === 'ACCOUNT_UPDATE') {
            this.#store.trading.eventAccountUpdate(data.a);
            void this.#store.trading.loadPositions();
            void this.reloadFuturesAccount();
          } else if (event === 'ORDER_TRADE_UPDATE') {
            this.#store.trading.eventOrderUpdate(data.o, updateTime);
            void this.#store.trading.loadOrders();
            void this.reloadFuturesAccount();
          } else if (event === 'ACCOUNT_CONFIG_UPDATE') {
            void this.#store.trading.loadPositions();
            void this.#store.trading.loadOrders();
            void this.reloadFuturesAccount();
          } else if (event === 'listenKeyExpired') {
            // eslint-disable-next-line no-console
            console.info('Closing...');
            stream.close();
          }
        } catch (e) {
          notify('error', e as Error);
        }
      };

      stream.onerror = (e) => {
        void reconnect(e, 'Account stream error. Reconnecting...');
      };

      stream.onclose = async (e) => {
        // eslint-disable-next-line no-console
        console.info('Account stream closed. Re-opening it...', e);
        await delay(3000);
        void this.#openStream();
      };
    } catch (e) {
      void reconnect(e as Error, 'Could not open account stream. Reconnecting...');
    }
  };
}
