import { listenChange } from 'use-change';
import * as api from '../api';
import { AltamoonLayout } from './types';

function persist<T>(key: keyof Persistent, defaultValue: T): T {
  const storageValue = localStorage.getItem(key);
  return storageValue ? JSON.parse(storageValue) as T : defaultValue;
}

export const defaultLayouts = {
  chart: {
    w: 120, h: 24, x: 0, y: 0, i: 'chart',
  },
  trading: {
    w: 26, h: 35, x: 0, y: 24, i: 'trading',
  },
  positionAndOrders: {
    w: 47, h: 17, x: 26, y: 42, i: 'positionAndOrders',
  },
  lastTrades: {
    w: 21, h: 21, x: 99, y: 24, i: 'lastTrades',
  },
  orderBook: {
    w: 47, h: 18, x: 26, y: 24, i: 'orderBook',
  },
  wallet: {
    w: 26, h: 21, x: 73, y: 24, i: 'wallet',
  },
  minicharts: {
    w: 47, h: 14, x: 73, y: 45, i: 'minicharts',
  },
};

export default class Persistent {
  public symbol = persist<string>('symbol', 'BTCUSDT');

  public interval = persist<api.CandlestickChartInterval>('interval', '1d');

  public tradingType = persist<api.OrderType>('tradingType', 'MARKET');

  public tradingPostOnly = persist<boolean>('tradingPostOnly', false);

  public tradingBuyReduceOnly = persist<boolean>('tradingBuyReduceOnly', false);

  public tradingSellReduceOnly = persist<boolean>('tradingSellReduceOnly', false);

  public tradingExactSizeBuyStr = persist<string>('tradingExactSizeBuyStr', '');

  public tradingExactSizeSellStr = persist<string>('tradingExactSizeSellStr', '');

  public tradingIsPercentModeBuy = persist<boolean>('tradingIsPercentModeBuy', false);

  public tradingIsPercentModeSell = persist<boolean>('tradingIsPercentModeSell', false);

  public binanceApiKey = persist<string | null>('binanceApiKey', null);

  public binanceApiSecret = persist<string | null>('binanceApiSecret', null);

  public ignoreValuesBelowNumber = persist<number>('ignoreValuesBelowNumber', 10);

  public symbolAlerts = persist<Record<string, number[]>>('symbolAlerts', {});

  public pluginsEnabled = persist<string[]>('pluginsEnabled', []);

  public widgetsDisabled = persist<string[]>('widgetsDisabled', []);

  public widgetsNumberOfColumns = persist<number>('widgetsNumberOfColumns', 120);

  public chartPaddingTopPercent = persist<number>('chartPaddingTopPercent', 10);

  public chartPaddingBottomPercent = persist<number>('chartPaddingBottomPercent', 10);

  public chartPaddingRightPercent = persist<number>('chartPaddingRightPercent', 15);

  public shouldChartShowOrders = persist<boolean>('shouldChartShowOrders', true);

  public chartOrdersNumber = persist<number>('chartOrdersNumber', 1000);

  public chartUpdateFrequency = persist<number>('chartUpdateFrequency', 50);

  public chartShouldShowBidAskLines = persist<boolean>('chartShouldShowBidAskLines', false);

  public chartShouldShowEma = persist<[boolean, boolean, boolean, boolean]>('chartShouldShowEma', [false, false, false, false]);

  public chartEmaNumbers = persist<[number, number, number, number]>('chartEmaNumbers', [5, 10, 50, 100]);

  public chartEmaColors = persist<[string, string, string, string]>('chartEmaColors', ['#ff0000', '#00ff00', '#0000ff', '#ffff00']);

  public chartShouldShowSupertrend = persist<boolean>('chartShouldShowSupertrend', false);

  public chartSupertrendPeroid = persist<number>('chartSupertrendPeroid', 10);

  public chartSupertrendMultiplier = persist<number>('chartSupertrendMultiplier', 3);

  public chartSupertrendDownTrendColor = persist<string>('chartSupertrendDownTrendColor', '#ff0000');

  public chartSupertrendUpTrendColor = persist<string>('chartSupertrendUpTrendColor', '#00ff00');

  public chartShouldShowSubminuteIntervals = persist<boolean>('chartShouldShowSubminuteIntervals', false);

  public chartShouldShowVolume = persist<boolean>('chartShouldShowVolume', false);

  public tradingWidgetPercentButtonsCount = persist<number>('tradingWidgetPercentButtonsCount', 4);

  public testnetBinanceApiKey = persist<string | null>('testnetBinanceApiKey', '45f8b1dfd0c2c57575f5d9991b11117ede55aa158f58ba0179e05f6778bedb64');

  public testnetBinanceApiSecret = persist<string | null>('testnetBinanceApiSecret', 'a7cc73a3480c75776a5244bbffd8373988e285ee68c8b22d78bc26712b18abdb');

  public isTestnet = persist<boolean>('isTestnet', true);

  public tradingWidgetPercentButtonsLayouts = persist<Record<number, number[]>>('tradingWidgetPercentButtonsLayouts', {
    4: [1, 2, 5, 10],
    6: [1, 2, 5, 10, 15, 25],
  });

  public widgetLayouts = persist<AltamoonLayout[]>('widgetLayouts', [{
    id: 'DEFAULT',
    isEnabled: true,
    name: 'Default',
    individualLayouts: defaultLayouts,
  }]);

  public compactModeSide = persist<api.OrderSide>('compactModeSide', 'BUY');

  public hiddenPositionColumns = persist<string[]>('hiddenPositionColumns', []);

  public hiddenOrderColumns = persist<string[]>('hiddenOrderColumns', []);

  constructor() {
    Object.getOwnPropertyNames(this).forEach((key) => {
      listenChange(this, key as keyof Persistent, (value: unknown) => {
        localStorage.setItem(key, JSON.stringify(value));
      });
    });
  }

  public resetLayout = () => {
    this.widgetLayouts = this.widgetLayouts.map(
      (layout) => (layout.isEnabled ? { ...layout, individualLayouts: defaultLayouts } : layout),
    );
  };

  public deleteLayout = (id: string) => {
    if (id === 'DEFAULT') return;
    const enabledLayout = this.widgetLayouts.find(({ isEnabled }) => isEnabled);

    let widgetLayouts = this.widgetLayouts.filter((layout) => layout.id !== id);

    if (enabledLayout?.id === id) {
      widgetLayouts = this.widgetLayouts
        .map((layout) => (layout.id === 'DEFAULT' ? { ...layout, isEnabled: true } : layout));
    }

    this.widgetLayouts = widgetLayouts;
  };

  public addLayout = (name: string, uploadedLayout?: AltamoonLayout['individualLayouts']) => {
    const individualLayouts = uploadedLayout
      ?? this.widgetLayouts.find(({ isEnabled }) => isEnabled)?.individualLayouts;

    this.widgetLayouts = [
      ...this.widgetLayouts.map((layout) => ({ ...layout, isEnabled: false })),
      {
        name,
        id: new Date().toISOString(),
        isEnabled: true,
        individualLayouts: individualLayouts ?? defaultLayouts,
      },
    ];
  };

  public enableLayout = (id: string) => {
    this.widgetLayouts = this.widgetLayouts
      .map((layout) => ({ ...layout, isEnabled: layout.id === id }));
  };
}
