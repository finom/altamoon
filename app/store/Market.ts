import { listenChange } from 'use-change';

import * as api from '../api';
import binanceFeatureDepthSubscribe from '../lib/binanceFeatureDepthSubscribe';

const LAST_TRADES_COUNT = 30;

export default class Market {
  public lastTrades: api.FuturesAggTradeStreamTicker[] = [];

  public lastTrade: api.FuturesAggTradeStreamTicker | null = null;

  public lastPrice: number | null = null;

  public futuresExchangeSymbols: api.FuturesExchangeInfo['symbols'] = [];

  public currentSymbolInfo: api.FuturesExchangeInfoSymbol | null = null;

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
      this.#store.persistent.alerts = [];
      void this.#onSymbolChange(symbol);
    });

    listenChange(store.persistent, 'interval', (interval) => {
      this.#chartUnsubscribe?.();

      this.#chartUnsubscribe = api.futuresChartSubscribe(
        store.persistent.symbol,
        interval,
        (data) => {
          this.candles = data;
        }, 200,
      );
    });

    // call onSymbolChange on every symbol change and on load
    void this.#onSymbolChange(store.persistent.symbol);

    void api.futuresExchangeInfo().then(({ symbols }) => {
      this.futuresExchangeSymbols = symbols.sort(((a, b) => (a.symbol > b.symbol ? 1 : -1)));

      this.currentSymbolInfo = this.futuresExchangeSymbols.find(
        ({ symbol: s }) => s === store.persistent.symbol,
      ) ?? null;
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
    this.lastPrice = null;

    this.#depthUnsubscribe?.();
    this.#depthUnsubscribe = binanceFeatureDepthSubscribe(symbol, (asks, bids) => {
      this.asks = asks;
      this.bids = bids;
    });

    this.#chartUnsubscribe?.();
    this.#chartUnsubscribe = api.futuresChartSubscribe(
      symbol,
      this.#store.persistent.interval,
      (data) => {
        this.candles = data;
      }, 200,
    );

    this.currentSymbolInfo = this.futuresExchangeSymbols.find(
      ({ symbol: s }) => s === symbol,
    ) ?? null;
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
