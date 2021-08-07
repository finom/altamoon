import {
  debounce, keyBy, throttle, uniq,
} from 'lodash';
import { listenChange } from 'use-change';
import * as api from '../../api';
import delay from '../../lib/delay';
import notify from '../../lib/notify';
import { TradingOrder, TradingPosition } from '../types';

import calculateSizeFromString from './calculateSizeFromString';
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

export default class Trading {
  public openPositions: TradingPosition[] = [];

  public allSymbolsPositionRisk: Record<string, api.FuturesPositionRisk> = {};

  public openOrders: TradingOrder[] = [];

  public currentSymbolMaxLeverage = 1;

  public currentSymbolLeverage = 1;

  public isCurrentSymbolMarginTypeIsolated: boolean | null = null;

  public positionsKey?: string;

  public ordersKey?: string;

  public limitBuyPrice: number | null = null;

  public shouldShowLimitBuyPriceLine = false;

  public limitSellPrice: number | null = null;

  public shouldShowLimitSellPriceLine = false;

  public stopBuyPrice: number | null = null;

  public shouldShowStopBuyPriceLine = false;

  public stopSellPrice: number | null = null;

  public shouldShowStopSellPriceLine = false;

  public exactSizeLimitBuyStr = '';

  public exactSizeLimitSellStr = '';

  public exactSizeStopLimitBuyStr = '';

  public exactSizeStopLimitSellStr = '';

  public currentSymbolPseudoPosition: TradingPosition | null = null;

  #store: Store;

  public store: Store;

  #lastPriceUnsubscribe?: () => void;

  constructor(store: Store) {
    this.#store = store;
    this.store = store;

    listenChange(this, 'openPositions', (openPositions) => {
      this.positionsKey = openPositions.map(({ symbol }) => symbol).join();
    });

    listenChange(this, 'openOrders', (openOrders) => {
      this.ordersKey = openOrders.map(({ symbol }) => symbol).join();
    });

    listenChange(this, 'positionsKey', this.#listenLastPrices);
    listenChange(this, 'ordersKey', this.#listenLastPrices);

    listenChange(store.account, 'futuresAccount', async (futuresAccount) => {
      if (futuresAccount) {
        await Promise.all([
          this.loadPositions(),
          this.loadOrders(),
        ]);

        this.#updateLeverage(store.persistent.symbol);
      }
    });

    listenChange(this, 'currentSymbolLeverage', debounce(async (currentSymbolLeverage: number) => {
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

    listenChange(store.persistent, 'symbol', () => this.#updatePseudoPosition());
    listenChange(store.market, 'currentSymbolLastPrice', () => this.#updatePseudoPosition());
    listenChange(this, 'currentSymbolLeverage', () => this.#updatePseudoPosition());
    listenChange(this, 'allSymbolsPositionRisk', () => this.#updatePseudoPosition());
    listenChange(this, 'isCurrentSymbolMarginTypeIsolated', () => this.#updatePseudoPosition());
    this.#updatePseudoPosition();
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

  public loadPositions = throttle(async (): Promise<void> => {
    try {
      const positions = await api.futuresPositionRisk();
      const prices = await api.futuresPrices();

      this.allSymbolsPositionRisk = keyBy(positions, 'symbol');

      this.openPositions = positions
        .filter((position) => !!+position.positionAmt)
        .map((position) => getPositionInfo.call(this, position, +prices[position.symbol]))
        .sort(({ symbol: a }, { symbol: b }) => (a > b ? 1 : -1));

      this.#updateLeverage(this.#store.persistent.symbol);

      return undefined;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      // retry
      await delay(5000);
      return this.loadPositions();
    }
  }, 1000);

  public loadOrders = throttle(async (): Promise<void> => {
    try {
      const futuresOrders = await api.futuresOpenOrders();
      const prices = await api.futuresPrices();

      this.openOrders = futuresOrders
        .map((order) => getOrderInfo(order, +prices[order.symbol]))
        .sort(({ orderId: a }, { orderId: b }) => (a > b ? 1 : -1));

      return undefined;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      // retry
      await delay(5000);
      return this.loadOrders();
    }
  }, 1000);

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

  public calculateSizeFromString = (
    ...args: Parameters<typeof calculateSizeFromString>
  ): ReturnType<typeof calculateSizeFromString> => calculateSizeFromString.apply(this, args);

  #updatePseudoPosition = (): void => {
    const positionRisk = this.allSymbolsPositionRisk[this.#store.persistent.symbol];
    const lastPrice = this.#store.market.currentSymbolLastPrice ?? 0;

    this.currentSymbolPseudoPosition = positionRisk
      ? {
        ...getPositionInfo.call(this, positionRisk, lastPrice),
        entryPrice: lastPrice,
        leverage: this.currentSymbolLeverage,
      }
      : null;
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
    // unsubscribe from previously used endpoint
    this.#lastPriceUnsubscribe?.();

    // if no position/orders, don't create new subscription
    if (!this.openPositions.length && !this.openOrders.length) return;

    const symbolsToListen = uniq([
      ...this.openPositions.map(({ symbol }) => symbol),
      ...this.openOrders.map(({ symbol }) => symbol),
    ]);
    const { totalWalletBalance } = this.#store.account;
    // create new subscription and preserve endpoint to unsubscribe
    this.#lastPriceUnsubscribe = api.futuresAggTradeStream(
      symbolsToListen,
      (ticker) => {
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

        if (this.openOrders.length) {
          this.openOrders = this.openOrders.map((order) => {
            if (order.symbol === ticker.symbol) {
              const lastPrice = +ticker.price;
              return {
                ...order,
                lastPrice,
              };
            }

            return order;
          });
        }
      },
    );
  };
}
