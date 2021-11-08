import { Layouts } from 'react-grid-layout';
import { listenChange } from 'use-change';
import * as api from '../api';

function persist<T>(key: keyof Persistent, defaultValue: T): T {
  const storageValue = localStorage.getItem(key);
  return storageValue ? JSON.parse(storageValue) as T : defaultValue;
}

export default class Persistent {
  public symbol = persist<string>('symbol', 'BTCUSDT');

  public interval = persist<api.CandlestickChartInterval>('interval', '1d');

  public theme = persist<'dark' | 'light'>('theme', 'dark');

  public layouts = persist<Layouts>('layouts', {});

  public tradingType = persist<api.OrderType>('tradingType', 'MARKET');

  public tradingPostOnly = persist<boolean>('tradingPostOnly', false);

  public tradingReduceOnly = persist<boolean>('tradingReduceOnly', false);

  public binanceApiKey = persist<string | null>('binanceApiKey', null);

  public binanceApiSecret = persist<string | null>('binanceApiSecret', null);

  public ignoreValuesBelowNumber = persist<number>('ignoreValuesBelowNumber', 10);

  public symbolAlerts = persist<Record<string, number[]>>('symbolAlerts', {});

  public pluginsEnabled = persist<string[]>('pluginsEnabled', []);

  public widgetsDisabled = persist<string[]>('widgetsDisabled', []);

  public numberOfColumns = persist<number>('numberOfColumns', 12);

  public chartPaddingTopPercent = persist<number>('chartPaddingTopPercent', 10);

  public chartPaddingBottomPercent = persist<number>('chartPaddingBottomPercent', 10);

  public chartPaddingRightPercent = persist<number>('chartPaddingRightPercent', 10);

  public shouldChartShowOrders = persist<boolean>('shouldChartShowOrders', true);

  public chartOrdersNumber = persist<number>('chartOrdersNumber', 1000);

  public tradingWidgetPercentButtonsCount = persist<number>('tradingWidgetPercentButtonsCount', 4);

  // eslint-disable-next-line no-spaced-func
  public tradingWidgetPercentButtonsLayouts = persist<Record<number, number[]>>('tradingWidgetPercentButtonsLayouts', {
    4: [10, 25, 50], // + Max
    6: [5, 10, 20, 33.3, 50], // + Max
  });

  constructor() {
    Object.getOwnPropertyNames(this).forEach((key) => {
      listenChange(this, key as keyof Persistent, (value: unknown) => {
        localStorage.setItem(key, JSON.stringify(value));
      });
    });
  }
}
