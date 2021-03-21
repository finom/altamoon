import { Layout } from 'react-grid-layout';
import { listenChange } from 'use-change';
import binance from '../lib/binance';
import getPersistentStorageValue from '../lib/getPersistentStorageValue';

export default class Persistent {
  public symbol = getPersistentStorageValue<string, keyof Persistent>('symbol', 'BTCUSDT');

  public theme = getPersistentStorageValue<'dark' | 'default', keyof Persistent>('theme', 'default');

  public layout = getPersistentStorageValue<Layout[], keyof Persistent>('layout', []);

  public binanceApiKey = getPersistentStorageValue<string | null, keyof Persistent>('binanceApiKey', null);

  public binanceApiSecret = getPersistentStorageValue<string | null, keyof Persistent>('binanceApiSecret', null);

  public ignoreValuesBelowNumber = getPersistentStorageValue<number, keyof Persistent>('ignoreValuesBelowNumber', 10);

  constructor() {
    Object.getOwnPropertyNames(this).forEach((key) => {
      listenChange(this, key as keyof Persistent, (value: unknown) => {
        localStorage.setItem(key, JSON.stringify(value));
      });
    });

    const setBinanceOptions = () => {
      const { binanceApiKey, binanceApiSecret } = this;
      if (binanceApiKey && binanceApiSecret) {
        binance.options({
          APIKEY: binanceApiKey,
          APISECRET: binanceApiSecret,
        });
      }
    };

    listenChange(this, 'binanceApiKey', setBinanceOptions);
    listenChange(this, 'binanceApiSecret', setBinanceOptions);
    setBinanceOptions();
  }
}
