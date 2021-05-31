import { debounce } from 'lodash';
import { FuturesPositionRisk, OrderSide } from 'node-binance-api';
import { listenChange } from 'use-change';
import binance from '../lib/binance';
import binanceFuturesMaxLeverage from '../lib/binanceFuturesMaxLeverage';
import checkBinancePromiseError from '../lib/checkBinancePromiseError';

interface PositionInfo {
  baseValue: number;
  side: OrderSide;
  pnl: number;
  truePnl: number;
  pnlPercent: number;
  truePnlPercent: number;
}

export default class Trading {
  public positions: FuturesPositionRisk[] = [];

  public currentSymbolMaxLeverage = 1;

  public currentSymbolLeverage = 1;

  public isCurrentSymbolMarginTypeIsolated: boolean | null = null;

  #store: Store;

  constructor(store: Store) {
    this.#store = store;

    listenChange(store.account, 'futuresAccount', async (futuresAccount) => {
      if (futuresAccount) {
        const positions = await binance.futuresPositionRisk();

        console.log('positions', positions);

        if (!checkBinancePromiseError(positions)) {
          this.positions = positions
            .filter((position) => !!+position.positionAmt)
            .sort((a, b) => (a.symbol > b.symbol ? 1 : -1));
        }

        await this.#updateLeverage(store.persistent.symbol);
      }
    });

    listenChange(this, 'currentSymbolLeverage', debounce(async (currentSymbolLeverage: number, prev: number) => {
      const { symbol } = store.persistent;
      const resp = await binance.futuresLeverage(symbol, currentSymbolLeverage);

      if (checkBinancePromiseError(resp)) {
        this.currentSymbolLeverage = prev; // if errored, roll it back
        return;
      }

      this.currentSymbolLeverage = resp.leverage;

      this.positions = this.positions
        .map((item) => (item.symbol === symbol
          ? { ...item, leverage: resp.leverage.toString() } : item));
    }, 200));

    listenChange(this, 'isCurrentSymbolMarginTypeIsolated', async (isIsolated, prev) => {
      const { symbol } = store.persistent;
      if (prev !== null) {
        // if it isn't initial definition
        const resp = await binance.futuresMarginType(symbol, isIsolated ? 'ISOLATED' : 'CROSSED');

        if (checkBinancePromiseError(resp)) {
          this.isCurrentSymbolMarginTypeIsolated = prev; // if errored, roll it back
        }
      }
    });

    listenChange(store.persistent, 'symbol', (symbol) => this.#updateLeverage(symbol));
  }

  #updateLeverage = async (symbol: string): Promise<void> => {
    const currentSymbolMaxLeverage = await binanceFuturesMaxLeverage(symbol);
    const currentPosition = this.positions.find((item) => item.symbol === symbol);
    this.currentSymbolMaxLeverage = currentSymbolMaxLeverage;
    this.isCurrentSymbolMarginTypeIsolated = currentPosition?.marginType === 'isolated';
    this.currentSymbolLeverage = Math.min(
      currentSymbolMaxLeverage,
      +(currentPosition?.leverage ?? 1),
    );
  };

  public getFee = (qty: number, type: 'maker' | 'taker' = 'maker'): number => {
    const feeTier = this.#store.account.futuresAccount?.feeTier ?? 0;
    const feeRate = type === 'taker'
      ? [0.04, 0.04, 0.035, 0.032, 0.03, 0.027, 0.025, 0.022, 0.020, 0.017][feeTier]
      : [0.02, 0.016, 0.014, 0.012, 0.01, 0.008, 0.006, 0.004, 0.002, 0][feeTier];

    return (qty * feeRate) / 100;
  };

  public getPositionInfo = (position: FuturesPositionRisk): PositionInfo => {
    const truePositionPnl = this.#getPositionTruePnl(position);
    const positionPnl = this.#getPositionPnl(position);
    return {
      baseValue: +position.positionAmt * +position.entryPrice,
      side: +position.positionAmt >= 0 ? 'BUY' : 'SELL',
      truePnl: truePositionPnl.value,
      truePnlPercent: truePositionPnl.percent,
      pnl: positionPnl.value,
      pnlPercent: positionPnl.percent,
    };
  };

  #getPositionTruePnl = (
    position: FuturesPositionRisk,
  ): { value: number; percent: number; } => {
    const qty = +position.positionAmt;
    const price = this.#store.market.lastPrice ?? 0;
    const entryPrice = +position.entryPrice;
    const baseValue = +position.positionAmt * +position.entryPrice;
    const fee = this.getFee(qty); // Todo: get fee sum from order histo

    const pnl = (price - entryPrice) / (entryPrice * baseValue) - fee;
    return {
      value: pnl || 0,
      percent: pnl / this.#store.account.totalWalletBalance || 0,
    };
  };

  #getPositionPnl = (position: FuturesPositionRisk): { value: number; percent: number; } => {
    const {
      positionAmt, entryPrice, unRealizedProfit, leverage,
    } = position;

    const size = Math.abs(+positionAmt * +entryPrice);

    return {
      value: +unRealizedProfit,
      percent: (+unRealizedProfit * 100) / ((size + +unRealizedProfit) / +leverage),
    };
  };

  /*
  order(SYMBOL, qty, price, {
                'timeInForce': (data.postOnly) ? 'GTX' : 'GTC',
                'reduceOnly': data.reduceOnly.toString()
            })

            */
}
