import {
  isEqual,
  keyBy, pick, throttle, uniq,
} from 'lodash';
import { listenChange } from 'use-change';

import * as api from '../../api';
import delay from '../../lib/delay';
import notify from '../../lib/notify';
import { OrderToBeCreated, TradingOrder, TradingPosition } from '../types';

import calculateSizeFromString from './calculateSizeFromString';
import calculateLiquidationPrice from './calculateLiquidationPrice';
import createOrderFromDraft from './createOrderFromDraft';
import limitOrder from './limitOrder';
import marketOrder from './marketOrder';
import stopLimitOrder from './stopLimitOrder';
import stopMarketOrder from './stopMarketOrder';
import getPnlPositionPercent from './getPnlPositionPercent';
import getPnl from './getPnl';
import getPnlBalancePercent from './getPnlBalancePercent';
import getPositionInfo from './getPositionInfo';
import getOrderInfo from './getOrderInfo';
import closePosition from './closePosition';
import cancelAllOrders from './cancelAllOrders';
import cancelOrder from './cancelOrder';
import updateDrafts from './updateDrafts';
import getPseudoPosition from './getPseudoPosition';
import eventOrderUpdate from './eventOrderUpdate';
import eventAccountUpdate from './eventAccountUpdate';
import updateLeverage from './updateLeverage';
import loadPositionTrades from './loadPositionTrades';
import '../altamoon.d';

export default class Trading {
  public openPositions: TradingPosition[] = [];

  public allSymbolsPositionRisk: Record<string, api.FuturesPositionRisk> = {};

  public openOrders: TradingOrder[] = [];

  public ordersToBeCreated: OrderToBeCreated[] = [];

  // used at chart
  public currentSymbolAllOrders: api.FuturesOrder[] = [];

  public currentSymbolMaxLeverage = 1;

  public currentSymbolLeverage = 1;

  public isCurrentSymbolMarginTypeIsolated = false;

  public positionsKey?: string;

  public ordersKey?: string;

  public limitBuyPrice: number | null = null;

  public shouldShowLimitBuyPriceLine = false;

  public limitSellPrice: number | null = null;

  public shouldShowLimitSellPriceLine = false;

  public stopBuyPrice: number | null = null;

  public shouldShowStopBuyDraftPriceLine = false;

  public stopSellPrice: number | null = null;

  public shouldShowStopSellDraftPriceLine = false;

  public currentSymbolPseudoPosition: TradingPosition | null = null;

  /**
   * The object contains actual lastPrices for symbols that are currently listened.
   * In other words prices of symbols of current open positions and orders
   */
  public listenedLastPrices: Record<string, number> = {};

  /**
   * We need to store canceled order IDs because WebSocket and REST API can return different data.
   * For example, REST request is made before order is closed, WebSocket reacts immediately,
   * but the REST request returns outdated data
  */
  public canceledOrderIds: string[] = [];

  #store: altamoon.RootStore;

  public store: altamoon.RootStore;

  // allows to wait for leverage update ignoring account changes
  public leverageChangeRequestsCount = 0;

  #lastPriceUnsubscribe?: () => void;

  #activelyListenedSymbols: string[] = [];

  constructor(store: altamoon.RootStore) {
    this.#store = store;
    this.store = store;

    listenChange(this, 'openPositions', (openPositions) => {
      this.positionsKey = openPositions.filter(({ isClosed }) => !isClosed).map(({ symbol }) => symbol).join('/');
    });

    listenChange(this, 'openOrders', (openOrders) => {
      this.ordersKey = openOrders.filter(({ isCanceled }) => !isCanceled).map(({ orderId }) => orderId).join('/');
    });

    listenChange(this, 'positionsKey', this.#listenLastPrices);
    listenChange(this, 'ordersKey', this.#listenLastPrices);

    listenChange(store.account, 'futuresAccount', async (futuresAccount, previousValue) => {
      if (futuresAccount && previousValue === null) {
        await Promise.all([
          this.loadPositions(),
          this.loadOrders(),
        ]);
      }
    });

    setInterval(() => {
      void this.loadPositions();
    }, 10_000);

    /* listenChange(this, 'currentSymbolLeverage',
      debounce(async (currentSymbolLeverage: number) => {
      const { symbol } = store.persistent;
      try {
        const resp = await api.futuresLeverage(symbol, currentSymbolLeverage);
        this.currentSymbolLeverage = resp.leverage;
        this.openPositions = this.openPositions
          .map((item) => (item.symbol === symbol
            ? { ...item, leverage: resp.leverage } : item));
      } catch {
        const currentPosition = this.allSymbolsPositionRisk[symbol];
        if (currentPosition) {
          this.currentSymbolLeverage = +currentPosition.leverage; // if errored, roll it back
        }
      }
    }, 200)); */

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

    listenChange(store.persistent, 'symbol', (symbol) => {
      this.#updateLeverage(symbol);
      void this.loadAllOrders();

      this.shouldShowLimitSellPriceLine = false;
      this.shouldShowLimitBuyPriceLine = false;
    });

    // if futuresExchangeSymbols or leverageBrackets is loaded after positions,
    // update all positions wit missing data
    listenChange(store.market, 'futuresExchangeSymbols', (futuresExchangeSymbols) => {
      if (futuresExchangeSymbols && this.openPositions.length) {
        this.openPositions = this.openPositions.map((pos) => ({
          ...pos,
          baseAsset: futuresExchangeSymbols[pos.symbol].baseAsset,
          pricePrecision: futuresExchangeSymbols[pos.symbol].pricePrecision,
        }));
      }
    });
    listenChange(store.account, 'leverageBrackets', (leverageBrackets) => {
      if (leverageBrackets && this.openPositions.length) {
        this.openPositions = this.openPositions.map((pos) => {
          const bracket = this.#store.account.leverageBrackets[pos.symbol]?.find(
            ({ notionalCap }) => notionalCap > pos.baseValue,
          );
          const maintMarginRatio = bracket?.maintMarginRatio ?? 0;
          return {
            ...pos,
            maxLeverage: bracket?.initialLeverage ?? 1,
            maintMarginRatio,
            maintMargin: maintMarginRatio * pos.baseValue,
          };
        });
      }
    });

    // ----- Update pseudoPosition -----
    listenChange(store.persistent, 'symbol', () => this.#updatePseudoPosition());
    listenChange(store.market, 'currentSymbolLastPrice', () => this.#updatePseudoPosition());
    listenChange(this, 'currentSymbolLeverage', () => this.#updatePseudoPosition());
    listenChange(this, 'allSymbolsPositionRisk', () => this.#updatePseudoPosition());
    listenChange(this, 'isCurrentSymbolMarginTypeIsolated', () => this.#updatePseudoPosition());
    this.#updatePseudoPosition();

    // ----- Update orders -----
    // update orders if allSymbolsPositionRisk is loaded after them
    listenChange(this, 'allSymbolsPositionRisk', (allSymbolsPositionRisk) => {
      if (allSymbolsPositionRisk && this.openOrders.length) {
        this.openOrders = this.openOrders.map((order) => {
          const positionRisk = allSymbolsPositionRisk[order.symbol];

          const marginType = positionRisk?.marginType || 'isolated';
          const leverage = +positionRisk?.leverage || 1;

          return {
            ...order,
            marginType,
            leverage,
          };
        });
      }
    });

    // update orders if leverageBrackets is loaded after them
    listenChange(store.account, 'leverageBrackets', (leverageBrackets) => {
      if (leverageBrackets && this.openOrders.length) {
        this.openOrders = this.openOrders.map((order) => {
          const value = +order.price * (+order.origQty - +order.executedQty);
          const leverageBracket = this.store.account.leverageBrackets[order.symbol]?.find(
            ({ notionalCap }) => notionalCap > value,
          ) ?? null;

          return {
            ...order,
            leverageBracket,
          };
        });
      }
    });

    listenChange(this, 'currentSymbolLeverage', (currentSymbolLeverage) => {
      const { symbol } = this.#store.persistent;
      if (this.openOrders.find((order) => order.symbol === symbol)) {
        this.openOrders = this.openOrders.map((order) => (order.symbol === symbol ? {
          ...order, leverage: currentSymbolLeverage,
        } : order));
      }
    });

    listenChange(this, 'isCurrentSymbolMarginTypeIsolated', (isCurrentSymbolMarginTypeIsolated) => {
      const { symbol } = this.#store.persistent;
      if (this.openOrders.find((order) => order.symbol === symbol)) {
        this.openOrders = this.openOrders.map((order) => (order.symbol === symbol ? {
          ...order, marginType: isCurrentSymbolMarginTypeIsolated ? 'isolated' : 'cross',
        } : order));
      }
    });
  }

  public marketOrder = (
    ...args: Parameters<typeof marketOrder>
  ): ReturnType<typeof marketOrder> => marketOrder.apply(this, args);

  public limitOrder = (
    ...args: Parameters<typeof limitOrder>
  ): ReturnType<typeof limitOrder> => limitOrder.apply(this, args);

  public stopMarketOrder = (
    ...args: Parameters<typeof stopMarketOrder>
  ): ReturnType<typeof stopMarketOrder> => stopMarketOrder.apply(this, args);

  public stopLimitOrder = (
    ...args: Parameters<typeof stopLimitOrder>
  ): ReturnType<typeof stopLimitOrder> => stopLimitOrder.apply(this, args);

  public createOrderFromDraft = (
    ...args: Parameters<typeof createOrderFromDraft>
  ): ReturnType<typeof createOrderFromDraft> => createOrderFromDraft.apply(this, args);

  public closePosition = (
    ...args: Parameters<typeof closePosition>
  ): ReturnType<typeof closePosition> => closePosition.apply(this, args);

  public cancelOrder = (
    ...args: Parameters<typeof cancelOrder>
  ): ReturnType<typeof cancelOrder> => cancelOrder.apply(this, args);

  public cancelAllOrders = (
    ...args: Parameters<typeof cancelAllOrders>
  ): ReturnType<typeof cancelAllOrders> => cancelAllOrders.apply(this, args);

  public updateDrafts = (
    ...args: Parameters<typeof updateDrafts>
  ): ReturnType<typeof updateDrafts> => updateDrafts.apply(this, args);

  public eventOrderUpdate = (
    ...args: Parameters<typeof eventOrderUpdate>
  ): ReturnType<typeof eventOrderUpdate> => eventOrderUpdate.apply(this, args);

  public eventAccountUpdate = (
    ...args: Parameters<typeof eventAccountUpdate>
  ): ReturnType<typeof eventAccountUpdate> => eventAccountUpdate.apply(this, args);

  public calculateSizeFromString = (
    ...args: Parameters<typeof calculateSizeFromString>
  ): ReturnType<typeof calculateSizeFromString> => calculateSizeFromString.apply(this, args);

  public calculateLiquidationPrice = (
    position: Parameters<typeof calculateLiquidationPrice>[1],
    options?: { side: api.OrderSide },
  ): ReturnType<typeof calculateLiquidationPrice> => calculateLiquidationPrice.call(
    this, this.store.account.totalWalletBalance, position, options,
  );

  public getPseudoPosition = (
    ...args: Parameters<typeof getPseudoPosition>
  ): ReturnType<typeof getPseudoPosition> => getPseudoPosition.apply(this, args);

  public updateLeverage = (
    ...args: Parameters<typeof updateLeverage>
  ): ReturnType<typeof updateLeverage> => updateLeverage.apply(this, args);

  public loadPositionTrades = (
    ...args: Parameters<typeof loadPositionTrades>
  ): ReturnType<typeof loadPositionTrades> => loadPositionTrades.apply(this, args);

  public loadPositions = throttle(async (): Promise<void> => {
    try {
      const positions = await api.futuresPositionRisk();
      const prices = await api.futuresPrices();

      this.allSymbolsPositionRisk = keyBy(positions, 'symbol');

      this.openPositions = positions
        .filter((position) => !!+position.positionAmt)
        .map((position) => getPositionInfo.call(
          this, position, { lastPrice: +prices[position.symbol] },
        ))
        .sort(({ symbol: a }, { symbol: b }) => (a > b ? 1 : -1));

      this.openPositions.forEach(({ symbol }) => void this.loadPositionTrades(symbol));

      if (this.leverageChangeRequestsCount === 0) {
        this.#updateLeverage(this.#store.persistent.symbol);
      }

      return undefined;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      // retry
      await delay(5000);
      return this.loadPositions();
    }
  }, 5000);

  public loadOrders = throttle(async (): Promise<void> => {
    try {
      const { symbol } = this.#store.persistent;
      void this.loadAllOrders();
      const [futuresOpenOrders, prices] = await Promise.all([
        api.futuresOpenOrders(),
        api.futuresPrices(),
      ]);

      const currentSymbolMarginType: api.PositionMarginType = this.isCurrentSymbolMarginTypeIsolated ? 'isolated' : 'cross';
      const { currentSymbolLeverage } = this;

      this.openOrders = futuresOpenOrders
        .map((order) => {
          const positionRisk = this.allSymbolsPositionRisk[order.symbol];
          const marginType = positionRisk?.marginType || 'isolated';
          const leverage = +positionRisk?.leverage || 1;
          return getOrderInfo.call(this, order, {
            lastPrice: +prices[order.symbol],
            marginType: symbol === order.symbol
              ? currentSymbolMarginType
              : marginType,
            leverage: symbol === order.symbol ? currentSymbolLeverage : leverage,
          });
        })
        .sort(({ orderId: a }, { orderId: b }) => (a > b ? 1 : -1));

      return undefined;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      // retry
      await delay(5000);
      return this.loadOrders();
    }
  }, 5000);

  public getFeeRate = (type: 'maker' | 'taker'): number => {
    const feeTier = this.#store.account.futuresAccount?.feeTier ?? 0;
    const feeRate = type === 'taker'
      ? [0.04, 0.04, 0.035, 0.032, 0.03, 0.027, 0.025, 0.022, 0.020, 0.017][feeTier]
      : [0.02, 0.016, 0.014, 0.012, 0.01, 0.008, 0.006, 0.004, 0.002, 0][feeTier];

    return feeRate / 100;
  };

  public adjustPositionMargin = async (symbol: string, amount: number, type: 'ADD' | 'REMOVE'): Promise<null | unknown> => {
    try {
      const result = await api.futuresPositionMargin(symbol, amount, type === 'REMOVE' ? 2 : 1);
      notify('success', `Margin for ${symbol} is adjusted`);
      return result;
    } catch {
      return null;
    }
  };

  public calculateQuantity = ({
    symbol, price, size,
  }: { symbol: string; price: number; size: number; }): number => {
    const positionRisk = this.allSymbolsPositionRisk[symbol];
    const symbolInfo = this.#store.market.futuresExchangeSymbols[symbol];
    if (!positionRisk || !symbolInfo) return 0;
    const feeMultiplier = 1 - this.getFeeRate('maker') * +positionRisk.leverage;

    return Math.floor(
      (size / price) * (10 ** symbolInfo.quantityPrecision) * feeMultiplier,
    ) / (10 ** symbolInfo.quantityPrecision);
  };

  /**
   * Updates order arrows on the chart
   */
  public loadAllOrders = async (): Promise<void> => {
    this.currentSymbolAllOrders = await api.futuresAllOrders(this.#store.persistent.symbol);
  };

  #updatePseudoPosition = (): void => {
    this.currentSymbolPseudoPosition = this.getPseudoPosition();
  };

  #updateLeverage = (symbol: string): void => {
    const currentSymbolMaxLeverage = this.#store.account
      .leverageBrackets[symbol]?.[0].initialLeverage ?? 1;
    const currentPosition = this.allSymbolsPositionRisk[symbol];

    this.currentSymbolMaxLeverage = currentSymbolMaxLeverage;
    this.isCurrentSymbolMarginTypeIsolated = currentPosition?.marginType === 'isolated';
    this.currentSymbolLeverage = Math.min(
      currentSymbolMaxLeverage,
      +(currentPosition?.leverage ?? 1),
    );
  };

  #listenLastPrices = (): void => {
    const symbolsToListen = uniq([
      ...this.openPositions.map(({ symbol }) => symbol),
      ...this.openOrders.map(({ symbol }) => symbol),
    ]);

    // don't re-subscribe if listened symbols are the same
    if (isEqual(this.#activelyListenedSymbols, symbolsToListen)) return;

    this.#activelyListenedSymbols = symbolsToListen;

    // unsubscribe from previously used endpoint
    this.#lastPriceUnsubscribe?.();

    // if no position/orders, don't create new subscription
    if (!this.openPositions.length && !this.openOrders.length) return;

    const { totalWalletBalance } = this.#store.account;

    // remove last prices of symbols that aren't used anymore
    const newListenedLastPrices = pick(this.listenedLastPrices, symbolsToListen);

    // collect initial data for listened symbols, use existing value or market value
    for (const symbol of symbolsToListen) {
      newListenedLastPrices[symbol] = newListenedLastPrices[symbol]
        ?? +(this.store.market.allSymbolsTickers[symbol]?.close ?? 0);
    }

    // update listenedLastPrices withnew data
    this.listenedLastPrices = newListenedLastPrices;

    // create new subscription and preserve endpoint to unsubscribe
    this.#lastPriceUnsubscribe = api.futuresAggTradeStream(
      symbolsToListen,
      (ticker) => {
        // update listenedLastPrices on every tick
        this.listenedLastPrices = {
          ...this.listenedLastPrices,
          [ticker.symbol]: +ticker.price,
        };

        // update positions with new PNL, lastPrice etc
        if (this.openPositions.length) {
          this.openPositions = this.openPositions.map((position) => {
            if (position.symbol === ticker.symbol) {
              const lastPrice = +ticker.price;

              return {
                ...position,
                lastPrice,
                entryPrice: position.entryPrice,
                pnl: getPnl({
                  positionAmt: position.positionAmt,
                  lastPrice,
                  entryPrice: position.entryPrice,
                }),
                pnlPositionPercent: getPnlPositionPercent({
                  positionAmt: position.positionAmt,
                  lastPrice,
                  entryPrice: position.entryPrice,
                  leverage: position.leverage,
                }),
                pnlBalancePercent: getPnlBalancePercent({
                  positionAmt: position.positionAmt,
                  lastPrice,
                  entryPrice: position.entryPrice,
                  totalWalletBalance,
                }),
              };
            }

            return position;
          });
        }
      },
    );
  };
}
