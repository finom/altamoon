import { FuturesAggTradeStreamTicker, FuturesExchangeInfo } from 'node-binance-api';
import { listenChange } from '../hooks/useChange';
import binance from '../lib/binance';

const LAST_TRADES_COUNT = 30;

export default class Market {
  public lastTrades: FuturesAggTradeStreamTicker[] = [];

  public lastTrade: FuturesAggTradeStreamTicker | null = null;

  public lastPrice: number | null = null;

  public futuresExchangeSymbols: FuturesExchangeInfo['symbols'] = [];

  #store: Store;

  #subscriptionSymbols: string[] = [];

  constructor(store: Store) {
    this.#store = store;
    listenChange(store.persistent, 'symbol', this.#onSymbolChange);
    this.#onSymbolChange(store.persistent.symbol);

    void binance.futuresExchangeInfo().then(({ symbols }) => {
      this.futuresExchangeSymbols = symbols.sort(((a, b) => (a.symbol > b.symbol ? 1 : -1)));
    });
  }

  #onSymbolChange = (symbol: string): void => {
    // looks like there is no way to unsubscribe from a stream
    // this code allows to avoid that
    if (!this.#subscriptionSymbols.includes(symbol)) {
      binance.futuresAggTradeStream(symbol, this.#onAggTradeStreamTick);
      this.#subscriptionSymbols.push(symbol);

      // reset market data
      this.lastTrades = [];
      this.lastTrade = null;
      this.lastPrice = null;
    }
  };

  #onAggTradeStreamTick = (ticker: FuturesAggTradeStreamTicker): void => {
    const value = +ticker.price * +ticker.amount;
    const { ignoreValuesBelowNumber } = this.#store.persistent;
    if (ticker.symbol === this.#store.persistent.symbol && value >= ignoreValuesBelowNumber) {
      const lastTrades = [...this.lastTrades];
      lastTrades.unshift(ticker);
      if (lastTrades.length > LAST_TRADES_COUNT) {
        lastTrades.pop();
      }
      this.lastTrades = lastTrades;
    }
  };
}
