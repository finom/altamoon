import { FuturesIncome, FuturesUserTrades, IncomeType } from 'node-binance-api';
import { listenChange } from 'use-change';
import binance from '../lib/binance';

const getTodayEarlyTime = () => new Date(Date.now() - 4 * 60 * 60 * 1000).setHours(4);

export default class Stats {
  #store: Store;

  #income: FuturesIncome[] = [];

  #historyStart = getTodayEarlyTime();

  public pnlPercent = 0;

  public pnlValue = 0;

  public dailyPnlPercent = 0;

  public dailyPnlValue = 0;

  public breakEven = 0;

  public dailyBreakEven = 0;

  constructor(store: Store) {
    this.#store = store;

    listenChange(store.persistent, 'symbol', this.#calcStats);
    listenChange(store.account, 'positions', this.#calcStats);
    void this.#calcStats();
  }

  #calcStats = (): void => {
    // reset
    this.#income = [];
    this.#historyStart = getTodayEarlyTime();

    // then re-calculate
    this.#calcPnl();
    void this.#calcDailyPnl();

    void this.#calcBreakEven();

    // should be called after #calcPnl
    this.#calcDailyBreakEven(this.dailyPnlValue);
  };

  #getFee = (qty: number, type: 'limit' | 'market' = 'limit'): number => {
    const feeTier = this.#store.account.futuresAccount?.feeTier ?? 0;
    const feeRate = (type === 'market')
      ? [0.04, 0.04, 0.035, 0.032, 0.03, 0.027, 0.025, 0.022, 0.020, 0.017][feeTier]
      : [0.02, 0.016, 0.014, 0.012, 0.01, 0.008, 0.006, 0.004, 0.002, 0][feeTier];

    return (qty * feeRate) / 100;
  };

  #calcPnl = (): void => {
    const { symbol } = this.#store.persistent;
    const position = this.#store.account.positions.find((x) => x.symbol === symbol);

    if (!position || position.qty === 0) {
      this.pnlPercent = 0;
      this.pnlValue = 0;
      return;
    }

    const { qty } = position;
    const price = +(this.#store.market.lastTrade?.price ?? 0);
    const { baseValue, price: entryPrice } = position;
    const fee = this.#getFee(qty, 'limit'); // Todo: get fee sum from order history

    const pnl = (price - entryPrice) / (entryPrice * baseValue) - fee;

    this.pnlPercent = pnl / this.#store.account.totalWalletBalance;
    this.pnlValue = pnl || 0;
  };

  #calcDailyPnl = async (): Promise<void> => {
    const { symbol } = this.#store.persistent;
    const currentBalance = this.#store.account.totalWalletBalance;
    const todayEarlyTime = getTodayEarlyTime();
    const now = Date.now();

    if (this.#historyStart < todayEarlyTime) {
      this.#historyStart = todayEarlyTime;
      this.#income = [];
    }

    this.#income = this.#income.concat(await binance.futuresIncome({
      symbol,
      startTime: this.#historyStart,
      endTime: now,
      limit: 1000,
    }));

    this.#historyStart = now;

    const dailyPnlValue = this.#income.reduce((acc, incomeItem) => {
      const types: IncomeType[] = ['REALIZED_PNL', 'COMMISSION', 'FUNDING_FEE'];
      return acc + (types.includes(incomeItem.incomeType) ? +incomeItem.income : 0);
    }, 0);

    this.dailyPnlValue = dailyPnlValue;

    const oldBalance = currentBalance - dailyPnlValue;

    this.dailyPnlPercent = dailyPnlValue > 0
      ? dailyPnlValue / oldBalance
      // if in loss, show % required to recover loss
      // instead of % lost
      : dailyPnlValue / currentBalance;
  };

  /**
   * Returns all trades associated with the open position
   * for @symbol.
   */
  #getPositionTrades = async (): Promise<FuturesUserTrades[]> => {
    const { symbol } = this.#store.persistent;
    const position = this.#store.account.positions[0];

    if (!position) {
      return [];
    }

    const direction = position.side === 'BUY' ? 1 : -1;

    const trades = await binance.futuresUserTrades(symbol);

    let orderSum = 0;

    let i = trades.length - 1;

    for (; i >= 0; i -= 1) {
      const orderDirection = trades[i].side === 'BUY' ? 1 : -1;
      orderSum += orderDirection * +trades[i].qty;

      // Fixme: find proper fix for the very small values
      if (direction * (position.qty - orderSum) <= 0.001) {
        break;
      }
    }

    return trades.slice(i, trades.length);
  };

  #calcBreakEven = async (): Promise<void> => {
    const position = this.#store.account.positions[0];

    if (!position || position.qty === 0) {
      this.breakEven = 0;
      return;
    }

    const trades = await this.#getPositionTrades();

    const entryPrice = +position.price;
    const baseValue = +position.baseValue;

    let pnl = 0;
    trades.forEach((x) => { pnl += +x.realizedPnl; });

    let fees = 0;
    trades.forEach((x) => { fees += +x.commission; });
    fees += this.#getFee(Math.abs(baseValue)); // position closing fee

    this.breakEven = entryPrice * ((fees - pnl) / baseValue) + entryPrice;
  };

  #calcDailyBreakEven = (dailyPnlValue: number): void => {
    const position = this.#store.account.positions[0];

    if (!position || position.qty === 0) {
      this.dailyBreakEven = 0;
      return;
    }

    const entryPrice = +position.price;
    const baseValue = +position.baseValue;
    const fee = this.#getFee(Math.abs(baseValue));

    this.dailyBreakEven = Math.max(
      entryPrice * ((fee - dailyPnlValue) / baseValue) + entryPrice,
      0,
    );
  };
}
