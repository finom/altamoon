import { Layout } from 'react-grid-layout';
import { listenChange } from 'use-change';
import * as api from '../api';

function getPersistentStorageValue<T>(key: keyof Persistent, defaultValue: T): T {
  const storageValue = localStorage.getItem(key);
  return storageValue ? JSON.parse(storageValue) as T : defaultValue;
}

export default class Persistent {
  public symbol = getPersistentStorageValue<string>('symbol', 'BTCUSDT');

  public interval = getPersistentStorageValue<api.CandlestickChartInterval>('interval', '1d');

  public theme = getPersistentStorageValue<'dark' | 'light'>('theme', 'light');

  public layout = getPersistentStorageValue<Layout[]>('layout', []);

  public tradingType = getPersistentStorageValue<api.OrderType>('tradingType', 'MARKET');

  public tradingPostOnly = getPersistentStorageValue<boolean>('tradingPostOnly', false);

  public tradingReduceOnly = getPersistentStorageValue<boolean>('tradingReduceOnly', false);

  public binanceApiKey = getPersistentStorageValue<string | null>('binanceApiKey', null);

  public binanceApiSecret = getPersistentStorageValue<string | null>('binanceApiSecret', null);

  public ignoreValuesBelowNumber = getPersistentStorageValue<number>('ignoreValuesBelowNumber', 10);

  public alerts = getPersistentStorageValue<number[]>('alerts', []);

  public pluginsEnabled = getPersistentStorageValue<string[]>('pluginsEnabled', []);

  public widgetsDisabled = getPersistentStorageValue<string[]>('widgetsDisabled', []);

  public numberOfColumns = getPersistentStorageValue<number>('numberOfColumns', 12);

  constructor() {
    Object.getOwnPropertyNames(this).forEach((key) => {
      listenChange(this, key as keyof Persistent, (value: unknown) => {
        localStorage.setItem(key, JSON.stringify(value));
      });
    });
  }
}
