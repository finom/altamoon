import { keyBy } from 'lodash';
import { listenChange } from 'use-change';

import * as api from '../api';
import listenMultiChange from '../lib/listenMultiChange';

const LAST_TRADES_COUNT = 30;

export default class Market {
  public lastTrades: api.FuturesAggTradeStreamTicker[] = [];

  public lastTrade: api.FuturesAggTradeStreamTicker | null = null;

  public currentSymbolLastPrice: number | null = null;

  public futuresExchangeSymbols: Record<string, api.FuturesExchangeInfoSymbol> = {};

  public currentSymbolInfo: api.FuturesExchangeInfoSymbol | null = null;

  public currentSymbolPricePrecision = 0;

  public currentSymbolMarkPrice = 0;

  public currentSymbolBaseAsset: string | null = null;

  public asks: [number, number][] = [];

  public bids: [number, number][] = [];

  public candles: api.FuturesChartCandle[] = [];

  public priceDirection: 'NEUTRAL' | 'UP' | 'DOWN' = 'NEUTRAL';

  public get allSymbolsTickers(): Record<string, api.FuturesTicker> {
    return this.#allSymbolsTickers;
  }

  #allSymbolsTickers: Record<string, api.FuturesTicker> = {};

  public get allMarkPriceTickers(): Record<string, api.FuturesMarkPriceTicker> {
    return this.#allMarkPriceTickers;
  }

  #allMarkPriceTickers: Record<string, api.FuturesMarkPriceTicker> = {};

  #store: altamoon.RootStore;

  #depthUnsubscribe?: () => void;

  #aggTradeUnsubscribe?: () => void;

  #chartUnsubscribe?: () => void;

  constructor(store: altamoon.RootStore) {
    this.#store = store;

    this.#listenTickers();
    this.#listenMarkPrices();

    listenChange(store.persistent, 'symbol', this.#onSymbolChange);
    listenMultiChange(store.persistent, ['interval', 'symbol', 'chartUpdateFrequency'], this.#chartResubscribe);
    this.#onSymbolChange();
    void this.#chartResubscribe();

    listenChange(this, 'candles', this.#calculateLastPrice);

    listenChange(this, 'currentSymbolInfo', (currentSymbolInfo) => {
      this.currentSymbolBaseAsset = currentSymbolInfo?.baseAsset ?? null;
      this.currentSymbolPricePrecision = currentSymbolInfo?.pricePrecision ?? 0;
    });

    void api.futuresExchangeInfo().then(({ symbols }) => {
      this.futuresExchangeSymbols = keyBy(symbols, 'symbol');

      this.currentSymbolInfo = this.futuresExchangeSymbols[store.persistent.symbol] ?? null;
    });
  }

  #chartResubscribe = async () => {
    const { symbol, interval, chartUpdateFrequency } = this.#store.persistent;
    this.#chartUnsubscribe?.();

    const unsubscribe = api.futuresChartWorkerSubscribe({
      symbols: [symbol],
      interval,
      frequency: chartUpdateFrequency,
      callback: (_symbol, data) => { this.candles = data; },
      exchangeInfo: await api.futuresExchangeInfo(),
    });

    this.#chartUnsubscribe = unsubscribe;
  };

  #onSymbolChange = (): void => {
    const { symbol } = this.#store.persistent;
    this.#aggTradeUnsubscribe?.();
    this.#aggTradeUnsubscribe = api.futuresAggTradeStream(symbol, this.#onAggTradeStreamTick);

    this.asks = [];
    this.bids = [];

    // reset market data
    this.lastTrades = [];
    this.lastTrade = null;
    this.currentSymbolLastPrice = null;
    this.priceDirection = 'NEUTRAL';

    this.#depthUnsubscribe?.();
    this.#depthUnsubscribe = api.futuresDepthSubscribe(symbol, (asks, bids) => {
      this.asks = asks;
      this.bids = bids;
    });

    this.currentSymbolInfo = this.futuresExchangeSymbols[this.#store.persistent.symbol] ?? null;

    this.#calculateLastPrice();
  };

  #onAggTradeStreamTick = (ticker: api.FuturesAggTradeStreamTicker): void => {
    const value = +ticker.price * +ticker.amount;
    const { ignoreValuesBelowNumber } = this.#store.persistent;
    if (value >= ignoreValuesBelowNumber) {
      const lastTrades = [...this.lastTrades];
      lastTrades.unshift(ticker);
      if (lastTrades.length > LAST_TRADES_COUNT) {
        lastTrades.pop();
      }
      this.lastTrades = lastTrades;
    }
  };

  #calculateLastPrice = (): void => {
    const { candles } = this;
    const { symbol } = this.#store.persistent;
    const tickerPrice = +this.#allSymbolsTickers[symbol]?.close || null;
    const lastPrice = candles.length && candles[0].symbol === symbol
      ? +candles[candles.length - 1].close : tickerPrice;
    const prevPrice = this.currentSymbolLastPrice;

    if (prevPrice && lastPrice) {
      if (prevPrice !== lastPrice) {
        this.priceDirection = lastPrice > prevPrice ? 'UP' : 'DOWN';
      } // else keep same
    } else {
      this.priceDirection = 'NEUTRAL';
    }

    this.currentSymbolLastPrice = lastPrice;
  };

  #listenTickers = (): void => {
    api.futuresTickerStream(
      (ticker) => {
        Object.assign(this.#allSymbolsTickers, keyBy(ticker, 'symbol'));
        this.#calculateLastPrice();
      },
    );
  };

  #listenMarkPrices = (): void => {
    api.futuresMarkPriceStream(
      (ticker) => {
        const markPriceTickersMap = keyBy(ticker, 'symbol');
        const { symbol } = this.#store.persistent;

        if (symbol in markPriceTickersMap) {
          this.currentSymbolMarkPrice = +markPriceTickersMap[symbol].markPrice;
        }

        Object.assign(this.#allMarkPriceTickers, markPriceTickersMap);
      },
    );
  };
}
