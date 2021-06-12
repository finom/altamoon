import { listenChange } from 'use-change';
import * as api from '../api';

const getTodayEarlyTime = () => new Date(Date.now() - 4 * 60 * 60 * 1000).setHours(4);

export default class Stats {
  public pnlPercent = 0;

  public pnlValue = 0;

  public dailyPnlPercent = 0;

  public dailyPnlValue = 0;

  #store: Store;

  #income: api.FuturesIncome[] = [];

  #historyStart = getTodayEarlyTime();

  constructor(store: Store) {
    this.#store = store;

    listenChange(store.trading, 'tradingPositions', () => {
      this.#calcStats();
    });

    listenChange(store.persistent, 'symbol', this.#calcStats);
    void this.#calcStats();
  }

  #calcStats = (): void => {
    // reset
    this.#income = [];
    this.#historyStart = getTodayEarlyTime();

    // then re-calculate
    this.#calcPnl();
    void this.#calcDailyPnl();
  };

  #calcPnl = (): void => {
    const { tradingPositions } = this.#store.trading;

    if (!tradingPositions.length) {
      this.pnlPercent = 0;
      this.pnlValue = 0;
      return;
    }

    let pnl = 0;

    for (const {
      lastPrice, entryPrice, baseValue, positionAmt,
    } of tradingPositions) {
      const netPnl = (lastPrice - entryPrice) / (entryPrice * baseValue);
      const fee = this.#store.trading.getFee(positionAmt) * lastPrice;
      pnl += netPnl - fee;
    }

    this.pnlPercent = pnl / this.#store.account.totalWalletBalance;
    this.pnlValue = pnl || 0;
  };

  #calcDailyPnl = async (): Promise<void> => {
    const currentBalance = this.#store.account.totalWalletBalance;
    const todayEarlyTime = getTodayEarlyTime();
    const now = Date.now();

    if (this.#historyStart < todayEarlyTime) {
      this.#historyStart = todayEarlyTime;
      this.#income = [];
    }

    try {
      this.#income = this.#income.concat(await api.futuresIncome({
        startTime: this.#historyStart,
        endTime: now,
        limit: 1000,
      }));
    } catch {
      //
    }

    this.#historyStart = now;

    const dailyPnlValue = this.#income.reduce((acc, incomeItem) => {
      const types: api.IncomeType[] = ['REALIZED_PNL', 'COMMISSION', 'FUNDING_FEE'];
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
}
