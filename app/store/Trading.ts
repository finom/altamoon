import { debounce } from 'lodash';
import { FuturesPositionRisk, OrderSide } from 'node-binance-api';
import { listenChange } from 'use-change';
import binance from '../lib/binance';
import binanceFuturesMaxLeverage from '../lib/binanceFuturesMaxLeverage';
import checkBinancePromiseError from '../lib/checkBinancePromiseError';

interface TradingPosition {
  entryPrice: number;
  positionAmt: number;
  liquidationPrice: number;
  lastPrice: number;
  isolatedMargin: number;
  symbol: string;
  baseValue: number;
  side: OrderSide;
  pnl: number;
  truePnl: number;
  pnlPercent: number;
  truePnlPercent: number;
  leverage: number;
  marginType: FuturesPositionRisk['marginType'];
}

export default class Trading {
  public tradingPositions: TradingPosition[] = [];

  public currentSymbolMaxLeverage = 1;

  public currentSymbolLeverage = 1;

  public isCurrentSymbolMarginTypeIsolated: boolean | null = null;

  public positionsKey?: string;

  #store: Store;

  #lastPriceSubscriptionEndpoint?: string;

  constructor(store: Store) {
    this.#store = store;

    listenChange(this, 'tradingPositions', (tradingPositions) => {
      this.positionsKey = tradingPositions.map(({ symbol }) => symbol).join();
    });

    listenChange(this, 'positionsKey', this.#listenLastPrices);

    listenChange(store.account, 'futuresAccount', async (futuresAccount) => {
      if (futuresAccount) {
        await this.loadPositions();

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

      this.tradingPositions = this.tradingPositions
        .map((item) => (item.symbol === symbol
          ? { ...item, leverage: resp.leverage } : item));
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

  public loadPositions = async (): Promise<void> => {
    const positions = await binance.futuresPositionRisk();
    const prices = await binance.futuresPrices();

    if (checkBinancePromiseError(positions) || checkBinancePromiseError(prices)) return;
    this.tradingPositions = positions
      .filter((position) => !!+position.positionAmt)
      .map((position) => this.#getPositionInfo(position, +prices[position.symbol]))
      .sort((a, b) => (a.symbol > b.symbol ? 1 : -1));

    await this.#updateLeverage(this.#store.persistent.symbol);
  };

  #updateLeverage = async (symbol: string): Promise<void> => {
    const currentSymbolMaxLeverage = await binanceFuturesMaxLeverage(symbol);
    const currentPosition = this.tradingPositions.find((item) => item.symbol === symbol);
    this.currentSymbolMaxLeverage = currentSymbolMaxLeverage;
    this.isCurrentSymbolMarginTypeIsolated = currentPosition?.marginType === 'isolated';
    this.currentSymbolLeverage = Math.min(
      currentSymbolMaxLeverage,
      currentPosition?.leverage ?? 1,
    );
  };

  #listenLastPrices = (): void => {
    // unsubscribe from previously used endpoint
    if (this.#lastPriceSubscriptionEndpoint) {
      binance.futuresTerminate(this.#lastPriceSubscriptionEndpoint);
    }

    // if no position, don't create new subscription
    if (!this.tradingPositions.length) return;

    // create new subscription and preserve endpoint to unsubscribe
    this.#lastPriceSubscriptionEndpoint = binance.futuresAggTradeStream(
      this.tradingPositions.map(({ symbol }) => symbol),
      (ticker) => {
        this.tradingPositions = this.tradingPositions.map((position) => {
          if (position.symbol === ticker.symbol) {
            const lastPrice = +ticker.price;
            return {
              ...position,
              lastPrice,
              ...this.#getPositionPnl({
                positionAmt: position.positionAmt,
                lastPrice,
                entryPrice: position.entryPrice,
                leverage: position.leverage,
              }),
              ...this.#getPositionTruePnl({
                positionAmt: position.positionAmt,
                lastPrice,
                entryPrice: position.entryPrice,
              }),
            };
          }

          return position;
        });
      },
    );
  };

  public getFee = (qty: number, type: 'maker' | 'taker' = 'maker'): number => {
    const feeTier = this.#store.account.futuresAccount?.feeTier ?? 0;
    const feeRate = type === 'taker'
      ? [0.04, 0.04, 0.035, 0.032, 0.03, 0.027, 0.025, 0.022, 0.020, 0.017][feeTier]
      : [0.02, 0.016, 0.014, 0.012, 0.01, 0.008, 0.006, 0.004, 0.002, 0][feeTier];

    return (qty * feeRate) / 100;
  };

  #getPositionInfo = (
    positionRisk: FuturesPositionRisk, lastPrice: number,
  ): TradingPosition => ({
    lastPrice,
    ...this.#getPositionPnl({
      positionAmt: +positionRisk.positionAmt,
      lastPrice,
      entryPrice: +positionRisk.entryPrice,
      leverage: +positionRisk.leverage,
    }),
    ...this.#getPositionTruePnl({
      positionAmt: +positionRisk.positionAmt,
      lastPrice,
      entryPrice: +positionRisk.entryPrice,
    }),
    entryPrice: +positionRisk.entryPrice,
    positionAmt: +positionRisk.positionAmt,
    liquidationPrice: +positionRisk.liquidationPrice,
    isolatedMargin: +positionRisk.isolatedMargin,
    baseValue: +positionRisk.positionAmt * +positionRisk.entryPrice,
    side: +positionRisk.positionAmt >= 0 ? 'BUY' : 'SELL',
    leverage: +positionRisk.leverage,
    marginType: positionRisk.marginType,
    symbol: positionRisk.symbol,
  });

  #getPositionTruePnl = ({
    positionAmt,
    lastPrice,
    entryPrice,
  }: {
    positionAmt: number;
    lastPrice: number;
    entryPrice: number;
  }): { truePnl: number; truePnlPercent: number; } => {
    const qty = positionAmt;
    const baseValue = positionAmt * entryPrice;
    const fee = this.getFee(qty); // Todo: get fee sum from order histo

    const pnl = (lastPrice - entryPrice) / (entryPrice * baseValue) - fee;
    return {
      truePnl: pnl || 0,
      truePnlPercent: pnl / this.#store.account.totalWalletBalance || 0,
    };
  };

  #getPositionPnl = ({
    positionAmt,
    lastPrice,
    entryPrice,
    leverage,
  }: {
    positionAmt: number;
    lastPrice: number;
    entryPrice: number;
    leverage: number;
  }): { pnl: number; pnlPercent: number; } => {
    const pnl = positionAmt * (lastPrice - entryPrice);
    const baseValue = Math.abs(positionAmt * entryPrice);

    return {
      pnl,
      pnlPercent: (pnl * 100) / ((baseValue + pnl) / leverage),
    };
  };

  /*
  order(SYMBOL, qty, price, {
                'timeInForce': (data.postOnly) ? 'GTX' : 'GTC',
                'reduceOnly': data.reduceOnly.toString()
            })

            */
}
