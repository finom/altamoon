import { keyBy } from 'lodash';
import { listenChange } from 'use-change';

import * as api from '../api';
import binanceFeatureDepthSubscribe from '../lib/binanceFeatureDepthSubscribe';

const LAST_TRADES_COUNT = 30;

export default class Market {
  public lastTrades: api.FuturesAggTradeStreamTicker[] = [];

  public lastTrade: api.FuturesAggTradeStreamTicker | null = null;

  public currentSymbolLastPrice: number | null = null;

  public futuresExchangeSymbols: Record<string, api.FuturesExchangeInfoSymbol> = {};

  public currentSymbolInfo: api.FuturesExchangeInfoSymbol | null = null;

  public currentSymbolPricePrecision = 0;

  public currentSymbolBaseAsset: string | null = null;

  public asks: [number, number][] = [];

  public bids: [number, number][] = [];

  public candles: api.FuturesChartCandle[] = [];

  #store: Store;

  #depthUnsubscribe?: () => void;

  #aggTradeUnsubscribe?: () => void;

  #chartUnsubscribe?: () => void;

  constructor(store: Store) {
    this.#store = store;

    // call the handler on every symbol change but not on load
    listenChange(store.persistent, 'symbol', (symbol) => {
      void this.#onSymbolChange(symbol);
    });

    listenChange(store.persistent, 'interval', (interval) => {
      this.#chartUnsubscribe?.();

      this.#chartUnsubscribe = api.futuresChartSubscribe({
        symbol: store.persistent.symbol,
        interval,
        callback: (data) => { this.candles = data; },
        limit: 1000,
        firstTickFromCache: true,
      });
    });

    listenChange(this, 'candles', (candles) => {
      this.currentSymbolLastPrice = candles.length ? +candles[candles.length - 1].close : null;
    });

    listenChange(this, 'currentSymbolInfo', (currentSymbolInfo) => {
      this.currentSymbolBaseAsset = currentSymbolInfo?.baseAsset ?? null;
      this.currentSymbolPricePrecision = currentSymbolInfo?.pricePrecision ?? 0;
    });

    // call onSymbolChange on every symbol change and on load
    void this.#onSymbolChange(store.persistent.symbol);

    void api.futuresExchangeInfo().then(({ symbols }) => {
      this.futuresExchangeSymbols = keyBy(symbols, 'symbol');

      this.currentSymbolInfo = this.futuresExchangeSymbols[store.persistent.symbol] ?? null;
    });
  }

  #onSymbolChange = (symbol: string): void => {
    this.#aggTradeUnsubscribe?.();
    this.#aggTradeUnsubscribe = api.futuresAggTradeStream(symbol, this.#onAggTradeStreamTick);

    this.asks = [];
    this.bids = [];

    // reset market data
    this.lastTrades = [];
    this.lastTrade = null;

    this.#depthUnsubscribe?.();
    this.#depthUnsubscribe = binanceFeatureDepthSubscribe(symbol, (asks, bids) => {
      this.asks = asks;
      this.bids = bids;
    });

    this.#chartUnsubscribe?.();
    this.#chartUnsubscribe = api.futuresChartSubscribe({
      symbol,
      interval: this.#store.persistent.interval,
      callback: (data) => { this.candles = data; },
      limit: 1000,
      firstTickFromCache: true,
    });

    this.currentSymbolInfo = this.futuresExchangeSymbols[this.#store.persistent.symbol] ?? null;
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
}
