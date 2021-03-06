import { throttle } from 'lodash';
import { listenChange } from 'use-change';
import * as api from '../api';

const getTodayEarlyTime = () => {
  const date = new Date();
  date.setHours(4);
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);

  // if its 00:00 - 04:00
  if (date.getTime() > Date.now()) {
    date.setDate(date.getDate() - 1);
  }

  return date.getTime();
};

export default class Stats {
  public pnlPercent = 0;

  public pnlValue = 0;

  public dailyPnlPercent = 0;

  public dailyPnlValue = 0;

  public income: api.FuturesIncome[] = [];

  public dailyBNBCommissionSpent = 0;

  public totalPositionMargin = 0;

  #bnbCandles: api.FuturesChartCandle[] = [];

  #store: altamoon.RootStore;

  #historyStart = getTodayEarlyTime();

  constructor(store: altamoon.RootStore) {
    this.#store = store;

    listenChange(this, 'income', () => this.#calcStats());

    listenChange(store.trading, 'openPositions', () => this.#calcStats());

    api.futuresChartSubscribe({
      symbol: 'BNBUSDT',
      interval: '5m',
      callback: (bnbCandles) => { this.#bnbCandles = bnbCandles; },
      limit: 12 * 24,
    }); // last 24 hours

    void this.#calcStats();

    void this.loadIncome();

    listenChange(store.trading, 'openPositions', (openPositions) => {
      this.totalPositionMargin = openPositions
        .reduce((acc, { calculatedMargin }) => acc + calculatedMargin, 0);
    });
  }

  public loadIncome = throttle(async (): Promise<void> => {
    const todayEarlyTime = getTodayEarlyTime();
    const now = Date.now();
    if (this.#historyStart < todayEarlyTime) {
      this.#historyStart = todayEarlyTime;
      this.income = [];
    } else {
      let incomeResponse: api.FuturesIncome[];

      do {
        // eslint-disable-next-line no-await-in-loop
        incomeResponse = await api.futuresIncome({
          startTime: this.#historyStart,
          endTime: now,
          limit: 1000,
          recvWindow: 1000000,
        });

        this.income = this.income.concat(incomeResponse);
        this.#historyStart = (this.income[this.income.length - 1]?.time ?? now) + 1;
      } while (incomeResponse.length > 999);
    }
  }, 5000);

  #getBNBPriceByTime = (time: number): number | null => {
    const bnbCandles = this.#bnbCandles;

    if (!bnbCandles.length || time < bnbCandles[0].time) {
      return null; // price is unknown
    }

    for (let i = 0; i < bnbCandles.length - 1; i += 1) {
      if (bnbCandles[i].time < time && bnbCandles[i + 1].time > time) {
        return +bnbCandles[i].open;
      }
    }

    return null;
  };

  #calcStats = (): void => {
    // then re-calculate
    this.#calcPnl();
    this.#calcDailyPnl();
  };

  #calcPnl = (): void => {
    const { openPositions } = this.#store.trading;

    if (!openPositions.length) {
      this.pnlPercent = 0;
      this.pnlValue = 0;
      return;
    }

    let pnl = 0;

    for (const {
      lastPrice, entryPrice, baseValue, positionAmt,
    } of openPositions) {
      const netPnl = ((lastPrice - entryPrice) / entryPrice) * baseValue;
      const fee = this.#store.trading.getFeeRate('maker') * positionAmt * lastPrice;
      pnl += netPnl - fee;
    }

    this.pnlPercent = pnl / this.#store.account.totalWalletBalance || 0;
    this.pnlValue = pnl || 0;
  };

  #calcDailyPnl = (): void => {
    const currentBalance = this.#store.account.totalWalletBalance;

    const dailyPnlValue = this.income.reduce((acc, { incomeType, income, asset }) => {
      if (incomeType === 'REALIZED_PNL' || incomeType === 'FUNDING_FEE') {
        return acc + +income;
      }

      if (incomeType === 'COMMISSION') {
        if (asset === 'BNB') {
          return acc + (this.#getBNBPriceByTime(+income) ?? 0);
        }

        return acc + +income;
      }
      return acc;
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
