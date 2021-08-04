import {
  debounce, keyBy, throttle, uniq,
} from 'lodash';
import { listenChange } from 'use-change';
import * as api from '../api';
import { OrderSide } from '../api';
import delay from '../lib/delay';
import floorByPrecision from '../lib/floorByPrecision';
import notify from '../lib/notify';
import { TradingOrder, TradingPosition } from './types';

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

  #lastPriceUnsubscribe?: () => void;

  constructor(store: Store) {
    this.#store = store;

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

  public loadPositions = throttle(async (): Promise<void> => {
    try {
      const positions = await api.futuresPositionRisk();
      const prices = await api.futuresPrices();

      this.allSymbolsPositionRisk = keyBy(positions, 'symbol');

      this.openPositions = positions
        .filter((position) => !!+position.positionAmt)
        .map((position) => this.#getPositionInfo(position, +prices[position.symbol]))
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
        .map((order) => this.#getOrderInfo(order, +prices[order.symbol]))
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

  public marketOrder = async ({
    side, quantity, symbol, reduceOnly = false,
  }: {
    side: api.OrderSide; quantity: number; symbol: string; reduceOnly?: boolean;
  }): Promise<api.FuturesOrder | null> => {
    try {
      const result = await api.futuresMarketOrder(
        side, symbol, quantity, { reduceOnly },
      );

      await this.loadPositions();

      notify('success', `Position for ${symbol} is created`);

      return result;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      return null;
    }
  };

  public limitOrder = async ({
    side, quantity, price, symbol, reduceOnly = false, postOnly = false,
  }: {
    side: api.OrderSide;
    quantity: number;
    price: number;
    symbol: string;
    reduceOnly?: boolean;
    postOnly?: boolean;
  }): Promise<api.FuturesOrder | null> => {
    try {
      const result = await api.futuresLimitOrder(
        side,
        symbol,
        quantity,
        this.#floorPriceByTickSize(symbol, price),
        { reduceOnly, timeInForce: postOnly ? 'GTX' : 'GTC' },
      );

      await this.loadOrders();

      notify('success', `Limit order for ${symbol} is created`);

      if (side === 'BUY') {
        this.shouldShowLimitBuyPriceLine = false;
      } else {
        this.shouldShowLimitSellPriceLine = false;
      }

      return result;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      return null;
    }
  };

  public stopMarketOrder = async ({
    side, quantity, symbol, stopPrice, reduceOnly = false,
  }: {
    side: api.OrderSide;
    quantity: number;
    symbol: string;
    stopPrice: number;
    reduceOnly?: boolean;
  }): Promise<api.FuturesOrder | null> => {
    try {
      const result = await api.futuresStopMarketOrder(
        side, symbol, quantity, stopPrice, { reduceOnly },
      );

      await this.loadOrders();

      notify('success', `Stop market order for ${symbol} is created`);

      return result;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      return null;
    }
  };

  public stopLimitOrder = async ({
    side, quantity, price, stopPrice, symbol, reduceOnly = false, postOnly = false,
  }: {
    side: api.OrderSide;
    quantity: number;
    price: number;
    stopPrice: number;
    symbol: string;
    reduceOnly?: boolean;
    postOnly?: boolean;
  }): Promise<api.FuturesOrder | null> => {
    try {
      const result = await api.futuresStopLimitOrder(
        side,
        symbol,
        quantity,
        this.#floorPriceByTickSize(symbol, price),
        stopPrice,
        { reduceOnly, timeInForce: postOnly ? 'GTX' : 'GTC' },
      );

      await this.loadOrders();

      notify('success', `Stop limit order for ${symbol} is created`);

      if (side === 'BUY') {
        this.shouldShowLimitBuyPriceLine = false;
        this.shouldShowStopBuyPriceLine = false;
      } else {
        this.shouldShowLimitSellPriceLine = false;
        this.shouldShowStopSellPriceLine = false;
      }

      return result;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      return null;
    }
  };

  public closePosition = async (symbol: string, amt?: number): Promise<api.FuturesOrder | null> => {
    try {
      const position = this.openPositions.find((pos) => pos.symbol === symbol);

      if (!position) {
        throw new Error(`No open position of symbol "${symbol}" found`);
      }

      const { positionAmt } = position;
      let result;

      const amount = typeof amt !== 'undefined' ? amt : positionAmt;

      if (amount < 0) {
        result = await api.futuresMarketOrder('BUY', symbol, -amount, { reduceOnly: true });
      } else {
        result = await api.futuresMarketOrder('SELL', symbol, amount, { reduceOnly: true });
      }

      await this.loadPositions();

      if (Math.abs(amount) < Math.abs(positionAmt)) {
        notify('success', `Position ${symbol} is reduced by ${Math.abs(amount)}`);
      } else {
        notify('success', `Position ${symbol} is closed`);
      }

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

      notify('success', `Order for ${symbol} is canceled`);

      return result;
    } catch {
      return null;
    }
  };

  public cancelAllOrders = async (symbol: string): Promise<void> => {
    try {
      await api.futuresCancelAll(symbol);

      await this.loadOrders();

      notify('success', `All orders for ${symbol} are canceled`);
    } catch {} // caught by called methods
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
    buyDraftPrice, sellDraftPrice, stopBuyDraftPrice, stopSellDraftPrice,
  }: {
    buyDraftPrice: number | null;
    sellDraftPrice: number | null;
    stopBuyDraftPrice: number | null;
    stopSellDraftPrice: number | null;
  }): void => {
    const { tradingType } = this.#store.persistent;

    if (tradingType === 'LIMIT' || tradingType === 'STOP') {
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

    if (tradingType === 'STOP' || tradingType === 'STOP_MARKET') {
      if (typeof stopBuyDraftPrice === 'number') {
        this.stopBuyPrice = stopBuyDraftPrice;
        this.shouldShowStopBuyPriceLine = true;
      } else {
        this.shouldShowStopBuyPriceLine = false;
      }

      if (typeof stopSellDraftPrice === 'number') {
        this.stopSellPrice = stopSellDraftPrice;
        this.shouldShowStopSellPriceLine = true;
      } else {
        this.shouldShowStopSellPriceLine = false;
      }
    }
  };

  // used by Chart Widget compoment
  public createOrderFromDraft = async ({
    buyDraftPrice, sellDraftPrice, stopBuyDraftPrice, stopSellDraftPrice,
  }: {
    buyDraftPrice: number | null;
    sellDraftPrice: number | null;
    stopBuyDraftPrice: number | null;
    stopSellDraftPrice: number | null;
  }, side: OrderSide): Promise<void> => {
    const {
      tradingType, symbol, tradingReduceOnly: reduceOnly, tradingPostOnly: postOnly,
    } = this.#store.persistent;
    const price = side === 'BUY' ? buyDraftPrice : sellDraftPrice;
    const stopPrice = side === 'BUY' ? stopBuyDraftPrice : stopSellDraftPrice;

    if (tradingType !== 'LIMIT' && tradingType !== 'STOP') throw new Error(`Unable to create order from draft for ${tradingType} order type`);
    if (typeof price !== 'number') throw new Error('Price is not a number');

    if (tradingType === 'STOP') {
      if (!stopPrice) {
        notify('error', 'Stop price is not given');

        return;
      }

      const size = this.calculateSizeFromString(side === 'BUY' ? this.exactSizeStopLimitBuyStr : this.exactSizeStopLimitSellStr);

      const quantity = this.calculateQuantity({
        symbol,
        price,
        size,
      });

      if (!quantity) {
        notify('error', 'Order size is zero or not given');

        return;
      }

      await this.stopLimitOrder({
        side,
        quantity,
        price,
        stopPrice,
        symbol,
        reduceOnly,
        postOnly,
      });
    } else {
      const size = this.calculateSizeFromString(side === 'BUY' ? this.exactSizeLimitBuyStr : this.exactSizeLimitSellStr);

      const quantity = this.calculateQuantity({
        symbol,
        price,
        size,
      });

      if (!quantity) {
        notify('error', 'Order size is zero or not given');

        return;
      }

      await this.limitOrder({
        side,
        quantity,
        price,
        symbol,
        reduceOnly,
        postOnly,
      });
    }
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
    return Math.floor(
      +positionRisk.leverage
        * (size / price) * (10 ** symbolInfo.quantityPrecision),
    ) / (10 ** symbolInfo.quantityPrecision);
  };

  public calculateSizeFromString = (sizeStr: string): number => {
    const { totalWalletBalance } = this.#store.account;

    return sizeStr.endsWith('%')
      ? (+sizeStr.replace('%', '') / 100) * totalWalletBalance || 0
      : +sizeStr || 0;
  };

  #updatePseudoPosition = (): void => {
    const positionRisk = this.allSymbolsPositionRisk[this.#store.persistent.symbol];
    const lastPrice = this.#store.market.currentSymbolLastPrice ?? 0;

    this.currentSymbolPseudoPosition = positionRisk
      ? {
        ...this.#getPositionInfo(positionRisk, lastPrice),
        entryPrice: lastPrice,
        leverage: this.currentSymbolLeverage,
      }
      : null;
  };

  #floorPriceByTickSize = (symbol: string, price: number): number => {
    const info = this.#store.market.futuresExchangeSymbols[symbol];

    if (!info) return price;

    const priceFilter = info.filters.find(({ filterType }) => filterType === 'PRICE_FILTER');

    // priceFilter.filterType !== 'PRICE_FILTER' is used to ensute TS type
    if (!priceFilter || priceFilter.filterType !== 'PRICE_FILTER') return floorByPrecision(price, info.pricePrecision);

    const precision = String(+priceFilter.tickSize).split('.')[1].length;

    return floorByPrecision(price, precision);
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
                pnl: this.#getPnl({
                  positionAmt: position.positionAmt,
                  lastPrice,
                  entryPrice: position.entryPrice,
                }),
                pnlPositionPercent: this.#getPnlPositionPercent({
                  positionAmt: position.positionAmt,
                  lastPrice,
                  entryPrice: position.entryPrice,
                  leverage: position.leverage,
                }),
                pnlBalancePercent: this.#getPnlBalancePercent({
                  positionAmt: position.positionAmt,
                  lastPrice,
                  entryPrice: position.entryPrice,
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

  #getPositionInfo = (
    positionRisk: api.FuturesPositionRisk, lastPrice: number,
  ): TradingPosition => {
    const positionAmt = +positionRisk.positionAmt;
    const entryPrice = +positionRisk.entryPrice;
    const leverage = +positionRisk.leverage;
    const liquidationPrice = +positionRisk.liquidationPrice;
    const isolatedWallet = +positionRisk.isolatedWallet;
    const isolatedMargin = +positionRisk.isolatedMargin;
    const { marginType, symbol } = positionRisk;
    const baseValue = positionAmt * entryPrice;
    const initialAmt = positionAmt >= 0 ? Math.max(
      this.openPositions.find((p) => p.symbol === symbol)?.initialAmt ?? 0,
      positionAmt,
    ) : Math.min(
      this.openPositions.find((p) => p.symbol === symbol)?.initialAmt ?? 0,
      positionAmt,
    );
    const bracket = this.#store.account.leverageBrackets[symbol]?.find(
      ({ notionalCap }) => notionalCap > baseValue,
    );
    const maintMarginRatio = bracket?.maintMarginRatio ?? 0;

    return {
      // if positionAmt is increased, then use it as initial value,
      // if decrreased or remains the same then do nothing
      initialAmt,
      initialSize: (initialAmt * entryPrice) / leverage,
      lastPrice,
      pnl: this.#getPnl({
        positionAmt,
        lastPrice,
        entryPrice,
      }),
      pnlPositionPercent: this.#getPnlPositionPercent({
        positionAmt,
        lastPrice,
        entryPrice,
        leverage,
      }),
      pnlBalancePercent: this.#getPnlBalancePercent({
        positionAmt,
        lastPrice,
        entryPrice,
      }),
      entryPrice,
      positionAmt,
      liquidationPrice,
      isolatedWallet,
      isolatedMargin,
      baseValue,
      baseSize: baseValue / leverage,
      side: positionAmt >= 0 ? 'BUY' : 'SELL',
      leverage,
      marginType,
      symbol,
      baseAsset: this.#store.market.futuresExchangeSymbols[symbol]?.baseAsset ?? 'UNKNOWN',
      pricePrecision: this.#store.market.futuresExchangeSymbols[symbol]?.pricePrecision ?? 1,
      maxLeverage: bracket?.initialLeverage ?? 1,
      maintMarginRatio,
      maintMargin: maintMarginRatio * baseValue,
    };
  };

  #getPnl = ({
    positionAmt,
    lastPrice,
    entryPrice,
  }: {
    positionAmt: number;
    lastPrice: number;
    entryPrice: number;
  }): number => positionAmt * (lastPrice - entryPrice);

  #getPnlPositionPercent = ({
    positionAmt,
    lastPrice,
    entryPrice,
    leverage,
  }: {
    positionAmt: number;
    lastPrice: number;
    entryPrice: number;
    leverage: number;
  }): number => {
    if (positionAmt === 0) return positionAmt; // pseudo position has 0 positionAmt
    const pnl = this.#getPnl({ positionAmt, lastPrice, entryPrice });
    const baseValue = Math.abs(positionAmt * entryPrice);

    return (pnl * 100) / ((baseValue + pnl) / leverage);
  };

  #getPnlBalancePercent = ({
    positionAmt,
    lastPrice,
    entryPrice,
  }: {
    positionAmt: number;
    lastPrice: number;
    entryPrice: number;
  }): number => {
    if (positionAmt === 0) return positionAmt; // pseudo position has 0 positionAmt
    const baseValue = positionAmt * entryPrice;

    const pnl = ((lastPrice - entryPrice) / entryPrice) * baseValue;
    return (pnl / this.#store.account.totalWalletBalance) * 100 || 0;
  };

  #getOrderInfo = (order: api.FuturesOrder, lastPrice: number): TradingOrder => ({
    lastPrice,
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
