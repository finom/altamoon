import {
  FuturesAggTradeStreamTicker, FuturesChartCandle, FuturesExchangeInfo, FuturesExchangeInfoSymbol,
} from 'node-binance-api';
import { listenChange } from 'use-change';
import binance from '../lib/binance';
import binanceFeatureDepthSubscribe from '../lib/binanceFeatureDepthSubscribe';

const LAST_TRADES_COUNT = 30;

export default class Market {
  public lastTrades: FuturesAggTradeStreamTicker[] = [];

  public lastTrade: FuturesAggTradeStreamTicker | null = null;

  public lastPrice: number | null = null;

  public futuresExchangeSymbols: FuturesExchangeInfo['symbols'] = [];

  public currentSymbolInfo: FuturesExchangeInfoSymbol | null = null;

  public asks: [number, number][] = [];

  public bids: [number, number][] = [];

  public candles: FuturesChartCandle[] = [];

  #store: Store;

  #depthEndpoint?: string;

  #aggTradeEndpoint?: string;

  #chartEndpoint?: string;

  constructor(store: Store) {
    this.#store = store;

    // call the handler on every symbol change but not on load
    listenChange(store.persistent, 'symbol', (symbol) => {
      this.#store.persistent.alerts = [];
      void this.#onSymbolChange(symbol);
    });

    listenChange(store.persistent, 'interval', async (interval) => {
      if (this.#chartEndpoint) binance.futuresTerminate(this.#chartEndpoint);
      this.#chartEndpoint = await binance.futuresChart(
        store.persistent.symbol,
        interval,
        (_s, _i, data) => {
          this.candles = Object.values(data);
        }, 200,
      );
    });

    // call onSymbolChange on every symbol change and on load
    void this.#onSymbolChange(store.persistent.symbol);

    void binance.futuresExchangeInfo().then(({ symbols }) => {
      this.futuresExchangeSymbols = symbols.sort(((a, b) => (a.symbol > b.symbol ? 1 : -1)));

      this.currentSymbolInfo = this.futuresExchangeSymbols.find(
        ({ symbol: s }) => s === store.persistent.symbol,
      ) ?? null;
    });
  }

  #onSymbolChange = async (symbol: string): Promise<void> => {
    if (this.#aggTradeEndpoint) binance.futuresTerminate(this.#aggTradeEndpoint);
    this.#aggTradeEndpoint = binance.futuresAggTradeStream(symbol, this.#onAggTradeStreamTick);

    this.asks = [];
    this.bids = [];

    // reset market data
    this.lastTrades = [];
    this.lastTrade = null;
    this.lastPrice = null;

    if (this.#depthEndpoint) binance.futuresTerminate(this.#depthEndpoint);
    this.#depthEndpoint = binanceFeatureDepthSubscribe(symbol, (asks, bids) => {
      this.asks = asks;
      this.bids = bids;
    });

    if (this.#chartEndpoint) binance.futuresTerminate(this.#chartEndpoint);
    this.#chartEndpoint = await binance.futuresChart(
      symbol,
      this.#store.persistent.interval,
      (_s, _i, data) => {
        this.candles = Object.values(data);
      }, 200,
    );

    this.currentSymbolInfo = this.futuresExchangeSymbols.find(
      ({ symbol: s }) => s === symbol,
    ) ?? null;
  };

  #onAggTradeStreamTick = (ticker: FuturesAggTradeStreamTicker): void => {
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
