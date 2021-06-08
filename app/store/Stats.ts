import { listenChange } from 'use-change';
import * as api from '../api';

const getTodayEarlyTime = () => new Date(Date.now() - 4 * 60 * 60 * 1000).setHours(4);

// TODO IMPORTANT Calc stats for all positions instead of for a first

interface EnhancedPosition {
  leverage: number;
  price: number;
  qty: number;
  baseValue: number;
  side: api.OrderSide;
  symbol: string;
}
export default class Stats {
  public pnlPercent = 0;

  public pnlValue = 0;

  public dailyPnlPercent = 0;

  public dailyPnlValue = 0;

  public breakEven = 0;

  public dailyBreakEven = 0;

  private enhancedPositions: EnhancedPosition[] = [];

  #store: Store;

  #income: api.FuturesIncome[] = [];

  #historyStart = getTodayEarlyTime();

  constructor(store: Store) {
    this.#store = store;

    listenChange(store.trading, 'positionRisks', (positions) => {
      this.enhancedPositions = positions.map((p) => ({
        leverage: +p.leverage,
        price: +p.entryPrice,
        qty: +p.positionAmt,
        baseValue: +p.positionAmt * +p.entryPrice,
        side: +p.positionAmt >= 0 ? 'BUY' : 'SELL',
        symbol: p.symbol,
      }));

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

    void this.#calcBreakEven();

    // should be called after #calcPnl
    this.#calcDailyBreakEven(this.dailyPnlValue);
  };

  #calcPnl = (): void => {
    const { symbol } = this.#store.persistent;
    const position = this.enhancedPositions.find((x) => x.symbol === symbol);

    if (!position || position.qty === 0) {
      this.pnlPercent = 0;
      this.pnlValue = 0;
      return;
    }

    const { qty } = position;
    const price = +(this.#store.market.lastTrade?.price ?? 0);
    const { baseValue, price: entryPrice } = position;
    const fee = this.#store.trading.getFee(qty); // Todo: get fee sum from order history

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

    try {
      this.#income = this.#income.concat(await api.futuresIncome({
        symbol,
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

  /**
   * Returns all trades associated with the open position
   * for @symbol.
   */
  #getPositionTrades = async (): Promise<api.FuturesUserTrades[]> => {
    const { symbol } = this.#store.persistent;
    const position = this.enhancedPositions[0];

    if (!position) {
      return [];
    }

    const direction = position.side === 'BUY' ? 1 : -1;

    const trades = await api.futuresUserTrades(symbol);

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
    const position = this.enhancedPositions[0];

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
    fees += this.#store.trading.getFee(Math.abs(baseValue)); // position closing fee

    this.breakEven = entryPrice * ((fees - pnl) / baseValue) + entryPrice;
  };

  #calcDailyBreakEven = (dailyPnlValue: number): void => {
    const position = this.enhancedPositions[0];

    if (!position || position.qty === 0) {
      this.dailyBreakEven = 0;
      return;
    }

    const entryPrice = +position.price;
    const baseValue = +position.baseValue;
    const fee = this.#store.trading.getFee(Math.abs(baseValue));

    this.dailyBreakEven = Math.max(
      entryPrice * ((fee - dailyPnlValue) / baseValue) + entryPrice,
      0,
    );
  };
}
