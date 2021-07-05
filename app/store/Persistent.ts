import { Layout } from 'react-grid-layout';
import { listenChange } from 'use-change';
import * as api from '../api';

function getPersistentStorageValue<T, K extends string>(key: K, defaultValue: T): T {
  const storageValue = localStorage.getItem(key);
  return storageValue ? JSON.parse(storageValue) as T : defaultValue;
}

export default class Persistent {
  public symbol = getPersistentStorageValue<string, keyof Persistent>('symbol', 'BTCUSDT');

  public interval = getPersistentStorageValue<api.CandlestickChartInterval, keyof Persistent>('interval', '1d');

  public theme = getPersistentStorageValue<'dark' | 'light', keyof Persistent>('theme', 'light');

  public layout = getPersistentStorageValue<Layout[], keyof Persistent>('layout', []);

  public tradingType = getPersistentStorageValue<api.OrderType, keyof Persistent>('tradingType', 'MARKET');

  public binanceApiKey = getPersistentStorageValue<string | null, keyof Persistent>('binanceApiKey', null);

  public binanceApiSecret = getPersistentStorageValue<string | null, keyof Persistent>('binanceApiSecret', null);

  public ignoreValuesBelowNumber = getPersistentStorageValue<number, keyof Persistent>('ignoreValuesBelowNumber', 10);

  public alerts = getPersistentStorageValue<number[], keyof Persistent>('alerts', []);

  public pluginsEnabled = getPersistentStorageValue<string[], keyof Persistent>('pluginsEnabled', []);

  public widgetsEnabled = getPersistentStorageValue<string[], keyof Persistent>('widgetsEnabled', []);

  constructor() {
    Object.getOwnPropertyNames(this).forEach((key) => {
      listenChange(this, key as keyof Persistent, (value: unknown) => {
        localStorage.setItem(key, JSON.stringify(value));
      });
    });
  }
}
