import { debounce } from 'lodash';
import { listenChange } from 'use-change';
import * as api from '../api';
import binanceFuturesMaxLeverage from '../lib/binanceFuturesMaxLeverage';
import notify from '../lib/notify';
import { TradingPosition } from './types';

export default class Trading {
  public tradingPositions: TradingPosition[] = [];

  public positionRisks: api.FuturesPositionRisk[] = [];

  public currentSymbolMaxLeverage = 1;

  public currentSymbolLeverage = 1;

  public isCurrentSymbolMarginTypeIsolated: boolean | null = null;

  public positionsKey?: string;

  #store: Store;

  #lastPriceUnsubscribe?: () => void;

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

    listenChange(this, 'currentSymbolLeverage', debounce(async (currentSymbolLeverage: number) => {
      const { symbol } = store.persistent;
      try {
        const resp = await api.futuresLeverage(symbol, currentSymbolLeverage);
        this.currentSymbolLeverage = resp.leverage;
        this.tradingPositions = this.tradingPositions
          .map((item) => (item.symbol === symbol
            ? { ...item, leverage: resp.leverage } : item));
      } catch {
        const currentPosition = this.positionRisks.find((item) => item.symbol === symbol);
        if (currentPosition) {
          this.currentSymbolLeverage = +currentPosition.leverage; // if errored, roll it back
        }
      }
    }, 200));

    listenChange(this, 'isCurrentSymbolMarginTypeIsolated', async (isIsolated, prev) => {
      const { symbol } = store.persistent;
      const marginType = isIsolated ? 'ISOLATED' : 'CROSSED';
      const uglyCodePositionMarginType = isIsolated ? 'isolated' : 'cross';
      const currentPosition = this.positionRisks.find((item) => item.symbol === symbol);

      if (prev !== null && currentPosition?.marginType !== uglyCodePositionMarginType) {
        // if it isn't initial definition
        try {
          await api.futuresMarginType(symbol, marginType);
        } catch {
          this.isCurrentSymbolMarginTypeIsolated = prev; // if errored, roll it back
        }
      }
    });

    listenChange(store.persistent, 'symbol', (symbol) => this.#updateLeverage(symbol));
  }

  public loadPositions = async (): Promise<void> => {
    const positions = await api.futuresPositionRisk();
    const prices = await api.futuresPrices();

    this.positionRisks = positions;
    this.tradingPositions = positions
      .filter((position) => !!+position.positionAmt)
      .map((position) => this.#getPositionInfo(position, +prices[position.symbol]))
      .sort(({ symbol: a }, { symbol: b }) => (a > b ? 1 : -1));

    await this.#updateLeverage(this.#store.persistent.symbol);
  };

  public marketOrder = async ({
    side, quantity, symbol, reduceOnly,
  }: {
    side: api.OrderSide; quantity: number; symbol: string; reduceOnly: boolean;
  }): Promise<api.FuturesOrder | null> => {
    try {
      const { futuresExchangeSymbols } = this.#store.market;
      const symbolInfo = futuresExchangeSymbols[symbol];

      if (!symbolInfo) {
        throw new Error(`Symbol info for symbol "${symbol}" is not found`);
      }

      const createOrder = side === 'BUY' ? api.futuresMarketBuy : api.futuresMarketSell;
      const result = await createOrder(
        symbol, quantity, { reduceOnly },
      );

      await this.loadPositions();

      notify('success', `Position ${symbol} is created`);

      return result;
    } catch {
      return null;
    }
  };

  public closePosition = async (symbol: string): Promise<api.FuturesOrder | null> => {
    try {
      const position = this.tradingPositions.find((pos) => pos.symbol === symbol);

      if (!position) {
        throw new Error(`No open position of symbol "${symbol}" found`);
      }

      const { positionAmt } = position;
      let result;

      if (positionAmt < 0) {
        result = await api.futuresMarketBuy(symbol, -positionAmt, { reduceOnly: true });
      } else {
        result = await api.futuresMarketSell(symbol, positionAmt, { reduceOnly: true });
      }

      await this.loadPositions();

      notify('success', `Position ${symbol} is closed`);

      return result;
    } catch {
      return null;
    }
  };

  public getFee = (qty: number, type: 'maker' | 'taker' = 'maker'): number => {
    const feeTier = this.#store.account.futuresAccount?.feeTier ?? 0;
    const feeRate = type === 'taker'
      ? [0.04, 0.04, 0.035, 0.032, 0.03, 0.027, 0.025, 0.022, 0.020, 0.017][feeTier]
      : [0.02, 0.016, 0.014, 0.012, 0.01, 0.008, 0.006, 0.004, 0.002, 0][feeTier];

    return (qty * feeRate) / 100;
  };

  #updateLeverage = async (symbol: string): Promise<void> => {
    const currentSymbolMaxLeverage = await binanceFuturesMaxLeverage(symbol);
    const currentPosition = this.positionRisks.find((item) => item.symbol === symbol);
    this.currentSymbolMaxLeverage = currentSymbolMaxLeverage;
    this.isCurrentSymbolMarginTypeIsolated = currentPosition?.marginType === 'isolated';
    this.currentSymbolLeverage = Math.min(
      currentSymbolMaxLeverage,
      +(currentPosition?.leverage ?? 1),
    );
  };

  #listenLastPrices = (): void => {
    // unsubscribe from previously used endpoint
    this.#lastPriceUnsubscribe?.();

    // if no position, don't create new subscription
    if (!this.tradingPositions.length) return;

    // create new subscription and preserve endpoint to unsubscribe
    this.#lastPriceUnsubscribe = api.futuresAggTradeStream(
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

  #getPositionInfo = (
    positionRisk: api.FuturesPositionRisk, lastPrice: number,
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
    baseAsset: this.#store.market.futuresExchangeSymbols[positionRisk.symbol]?.baseAsset,
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

    const pnl = ((lastPrice - entryPrice) / entryPrice) * baseValue - (fee * lastPrice);
    return {
      truePnl: pnl || 0,
      truePnlPercent: (pnl / this.#store.account.totalWalletBalance) * 100 || 0,
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
