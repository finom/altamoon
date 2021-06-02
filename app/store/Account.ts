import { FuturesAccount } from 'node-binance-api';
import { listenChange } from 'use-change';
import binance from '../lib/binance';
import convertType from '../lib/convertType';
import checkBinancePromiseError from '../lib/checkBinancePromiseError';
import showError from '../lib/showError';

export default class Account {
  public totalWalletBalance = 0;

  public totalPositionInitialMargin = 0;

  public totalOpenOrderInitialMargin = 0;

  public futuresAccount: FuturesAccount | null = null;

  public futuresAccountError: string | null = null;

  #store: Store;

  constructor(store: Store) {
    this.#store = store;
    const setBinanceOptions = async () => {
      const { binanceApiKey, binanceApiSecret } = store.persistent;
      if (binanceApiKey && binanceApiSecret) {
        binance.options({
          APIKEY: binanceApiKey,
          APISECRET: binanceApiSecret,
        });
      }
      void this.#openStream();
      await this.reloadFuturesAccount();
    };

    listenChange(store.persistent, 'binanceApiKey', setBinanceOptions);
    listenChange(store.persistent, 'binanceApiSecret', setBinanceOptions);

    void setBinanceOptions();
  }

  public readonly reloadFuturesAccount = async (): Promise<void> => {
    const futuresAccount = await binance.futuresAccount();
    this.futuresAccount = checkBinancePromiseError(futuresAccount) ? null : futuresAccount;

    if (!this.futuresAccount) {
      this.futuresAccountError = convertType<{ msg: string }>(futuresAccount).msg;
      return;
    }

    this.futuresAccountError = null;

    this.totalWalletBalance = +futuresAccount.totalWalletBalance;
    this.totalPositionInitialMargin = +futuresAccount.totalPositionInitialMargin;
    this.totalOpenOrderInitialMargin = +futuresAccount.totalOpenOrderInitialMargin;
  };

  #openStream = async (): Promise<void> => {
    const { listenKey } = await binance.futuresGetDataStream();

    const stream = new WebSocket(`wss://fstream.binance.com/ws/${listenKey}`);

    stream.onmessage = ({ data }) => {
      try {
        const { e } = JSON.parse(data) as { e: string };
        if (e === 'ACCOUNT_UPDATE') {
          void this.#store.trading.loadPositions();
        }
      } catch (e) {
        showError(e as string);
      }
    };

    stream.onerror = () => showError('Account stream error');

    /* console.log('listenKey', listenKey);
    binance.futuresSubscribe(listenKey, (data) => {
      console.log('data', data)
    })
    /* this.#stream = stream;

    console.log('ololo')

    stream.onopen = () => {
      console.log('onopen')
      // this.rest.getOpenOrders()
      // this.rest.getPosition()
    };

    stream.onmessage = (e) => {
      console.log(e);
      /* const data = JSON.parse(e.data)

      if (data.e == 'ORDER_TRADE_UPDATE')
          this._orderUpdate(data)
      if (data.e == 'ACCOUNT_UPDATE') {
          this._positionUpdate(data)
          this._balancesUpdate(data)
      }
    } */

    // Ping every 10 min to keep stream alive
    /* setInterval(() => {
            this.lib.futuresGetDataStream()
                .catch(e => console.error(e))
        }, 20 * 60000
    )

    // Reopen if closed
    stream.onclose = () => this.stream() */
  };

  /*
   stream () {
        // Get key
        this.lib.futuresGetDataStream()
            .then(response => this._openStream(response))
            .catch(err => console.error(err))
    }

    _openStream (key) {
        let stream = new WebSocket('wss://fstream.binance.com/ws/' + key.listenKey)

        // Get what happened before the stream opened
        stream.onopen = () => {
            this.rest.getOpenOrders()
            this.rest.getPosition()
        }

        stream.onmessage = (e) => {
            let data = JSON.parse(e.data)

            if (data.e == 'ORDER_TRADE_UPDATE')
                this._orderUpdate(data)
            if (data.e == 'ACCOUNT_UPDATE') {
                this._positionUpdate(data)
                this._balancesUpdate(data)
            }
        }

        // Ping every 10 min to keep stream alive
        setInterval(() => {
                this.lib.futuresGetDataStream()
                    .catch(e => console.error(e))
            }, 20 * 60000
        )

        // Reopen if closed
        stream.onclose = () => this.stream()
    }
  */
}
