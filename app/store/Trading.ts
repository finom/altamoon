import { debounce, keyBy } from 'lodash';
import { listenChange } from 'use-change';
import * as api from '../api';
import binanceFuturesMaxLeverage from '../lib/binanceFuturesMaxLeverage';
import delay from '../lib/delay';
import notify from '../lib/notify';
import { TradingOrder, TradingPosition } from './types';

export default class Trading {
  public tradingPositions: TradingPosition[] = [];

  public allSymbolsPositionRisk: Record<string, api.FuturesPositionRisk> = {};

  public openOrders: TradingOrder[] = [];

  public currentSymbolMaxLeverage = 1;

  public currentSymbolLeverage = 1;

  public isCurrentSymbolMarginTypeIsolated: boolean | null = null;

  public positionsKey?: string;

  public limitBuyPrice: number | null = null;

  public shouldShowLimitBuyPriceLine = false;

  public limitSellPrice: number | null = null;

  public shouldShowLimitSellPriceLine = false;

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
        await Promise.all([
          this.loadPositions(),
          this.loadOrders(),
        ]);

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
        const currentPosition = this.allSymbolsPositionRisk[symbol];
        if (currentPosition) {
          this.currentSymbolLeverage = +currentPosition.leverage; // if errored, roll it back
        }
      }
    }, 200));

    listenChange(this, 'isCurrentSymbolMarginTypeIsolated', async (isIsolated, prev) => {
      const { symbol } = store.persistent;
      const marginType = isIsolated ? 'ISOLATED' : 'CROSSED';
      const uglyCodePositionMarginType = isIsolated ? 'isolated' : 'cross';
      const currentPosition = this.allSymbolsPositionRisk[symbol];

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
    try {
      const positions = await api.futuresPositionRisk();
      const prices = await api.futuresPrices();

      this.allSymbolsPositionRisk = keyBy(positions, 'symbol');

      this.tradingPositions = positions
        .filter((position) => !!+position.positionAmt)
        .map((position) => this.#getPositionInfo(position, +prices[position.symbol]))
        .sort(({ symbol: a }, { symbol: b }) => (a > b ? 1 : -1));

      await this.#updateLeverage(this.#store.persistent.symbol);
      return undefined;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      // retry
      await delay(3000);
      return this.loadPositions();
    }
  };

  public loadOrders = async (): Promise<void> => {
    try {
      const futuresOrders = await api.futuresOpenOrders();

      this.openOrders = futuresOrders
        .map(this.#getOrderInfo)
        .sort(({ orderId: a }, { orderId: b }) => (a > b ? 1 : -1));

      return undefined;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      // retry
      await delay(3000);
      return this.loadOrders();
    }
  };

  public marketOrder = async ({
    side, quantity, symbol, reduceOnly,
  }: {
    side: api.OrderSide; quantity: number; symbol: string; reduceOnly: boolean;
  }): Promise<api.FuturesOrder | null> => {
    try {
      const createOrder = side === 'BUY' ? api.futuresMarketBuy : api.futuresMarketSell;
      const result = await createOrder(
        symbol, quantity, { reduceOnly },
      );

      await this.loadOrders();

      notify('success', `Position for ${symbol} is created`);

      return result;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      return null;
    }
  };

  public limitOrder = async ({
    side, quantity, price, symbol, reduceOnly, postOnly,
  }: {
    side: api.OrderSide;
    quantity: number;
    price: number;
    symbol: string;
    reduceOnly: boolean;
    postOnly: boolean;
  }): Promise<api.FuturesOrder | null> => {
    try {
      const createOrder = side === 'BUY' ? api.futuresLimitBuy : api.futuresLimitSell;
      const result = await createOrder(
        symbol, quantity, price, { reduceOnly, timeInForce: postOnly ? 'GTX' : 'GTC' },
      );

      await this.loadOrders();

      notify('success', `Order for ${symbol} is created`);

      return result;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
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

  public cancelOrder = async (
    symbol: string, orderId: number,
  ): Promise<api.FuturesOrder | null> => {
    try {
      const result = await api.futuresCancel(symbol, orderId);

      await this.loadOrders();

      notify('success', `Order for ${symbol} is closed`);

      return result;
    } catch {
      return null;
    }
  };

  public cancelAllOrders = async (symbol: string): Promise<void> => {
    try {
      await api.futuresCancelAll(symbol);

      await this.loadOrders();

      notify('success', `All orders for ${symbol} are closed`);
    } catch {
    }
  };

  public getFee = (qty: number, type: 'maker' | 'taker' = 'maker'): number => {
    const feeTier = this.#store.account.futuresAccount?.feeTier ?? 0;
    const feeRate = type === 'taker'
      ? [0.04, 0.04, 0.035, 0.032, 0.03, 0.027, 0.025, 0.022, 0.020, 0.017][feeTier]
      : [0.02, 0.016, 0.014, 0.012, 0.01, 0.008, 0.006, 0.004, 0.002, 0][feeTier];

    return (qty * feeRate) / 100;
  };

  // used by Chart Widget compoment
  public updateDrafts = ({
    buyDraftPrice, sellDraftPrice,
  }: { buyDraftPrice: number | null; sellDraftPrice: number | null; }): void => {
    if (this.#store.persistent.tradingType === 'LIMIT') {
      if (typeof buyDraftPrice === 'number') {
        this.limitBuyPrice = buyDraftPrice;
        this.shouldShowLimitBuyPriceLine = true;
      } else {
        this.shouldShowLimitBuyPriceLine = false;
      }

      if (typeof sellDraftPrice === 'number') {
        this.limitSellPrice = sellDraftPrice;
        this.shouldShowLimitSellPriceLine = true;
      } else {
        this.shouldShowLimitSellPriceLine = false;
      }
    }
  };

  #updateLeverage = async (symbol: string): Promise<void> => {
    const currentSymbolMaxLeverage = await binanceFuturesMaxLeverage(symbol);
    const currentPosition = this.allSymbolsPositionRisk[symbol];
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
    isolatedWallet: +positionRisk.isolatedWallet,
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

  #getOrderInfo = (order: api.FuturesOrder): TradingOrder => ({
    clientOrderId: order.clientOrderId,
    cumQuote: order.cumQuote,
    executedQty: +order.executedQty,
    orderId: order.orderId,
    avgPrice: +order.avgPrice,
    origQty: +order.origQty,
    price: +order.price,
    reduceOnly: order.reduceOnly,
    side: order.side,
    positionSide: order.positionSide,
    status: order.status,
    stopPrice: +order.stopPrice,
    closePosition: order.closePosition,
    symbol: order.symbol,
    timeInForce: order.timeInForce,
    type: order.type,
    origType: order.origType,
    updateTime: order.updateTime,
    workingType: order.workingType,
    priceProtect: order.priceProtect,
  });
}
