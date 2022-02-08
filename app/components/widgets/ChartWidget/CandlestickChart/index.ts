import $ from 'balajs';
import * as d3 from 'd3';
import { listenChange } from 'use-change';

import { isEqual, last } from 'lodash';
import * as api from '../../../../api';
import Axes from './items/Axes';
import ClipPath from './items/ClipPath';
import GridLines from './items/GridLines';
import Plot from './items/Plot';
import Svg from './items/Svg';
import Ema from './items/Ema';
import Supertrend from './items/Supertrend';

import './chart.global.css';

import {
  ResizeData, DrawData, Scales, StyleMargin, D3Selection,
  PriceLinesDatum, ChartPaddingPercents, DraftPrices, AlertItem,
} from './types';
import { TradingOrder, TradingPosition, OrderToBeCreated } from '../../../../store/types';
import { OrderSide } from '../../../../api';
import Measurer from './items/Measurer';
import store, { RootStore } from '../../../../store';
import Lines from './lines';
import OrderArrows from './items/OrderArrows';
import MarkPriceTriangle from './items/MarkPriceTriangle';
import listenMultiChange from '../../../../lib/listenMultiChange';

type ZooomTranslateBy = () => d3.Selection<d3.BaseType, unknown, null, undefined>;

interface Params {
  onUpdateAlerts: (d: AlertItem[]) => void;
  onUpdateDrafts: (d: DraftPrices) => void;
  onDoubleClick: () => void;
  onClickDraftCheck: (
    d: DraftPrices & { newClientOrderId: string; },
    side: OrderSide,
  ) => Promise<void>;
  onDragLimitOrder: (clientOrderId: string, price: number) => void;
  onCancelOrder: (clientOrderId: string) => void;
  draftPriceItems: PriceLinesDatum[];
  pricePrecision: number;
  paddingPercents: ChartPaddingPercents;
  calculateLiquidationPrice: RootStore['trading']['calculateLiquidationPrice'];
  calculateQuantity: RootStore['trading']['calculateQuantity'];
  getPseudoPosition: RootStore['trading']['getPseudoPosition'];
}

export default class CandlestickChart {
  #svg: Svg;

  #clipPath: ClipPath;

  #axes: Axes;

  #gridLines: GridLines;

  #plot: Plot;

  #ema: Ema;

  #supertrend: Supertrend;

  #width = 0;

  #height = 0;

  #margin: StyleMargin = {
    top: 0, right: 55, bottom: 30, left: 0,
  };

  #paddingPercents: ChartPaddingPercents;

  #scales: Scales;

  #container: HTMLElement;

  #measurer: Measurer;

  #orderArrows: OrderArrows;

  #markPriceTriangle: MarkPriceTriangle;

  #pricePrecision: number;

  #hasInitialScroll = false;

  #candles: api.FuturesChartCandle[] = [];

  #zoom = d3.zoom();

  #zoomTransform: Pick<d3.ZoomTransform, 'x' | 'y' | 'k'> = { k: 1, x: 0, y: 0 };

  #lines: Lines;

  #yDomain: [number, number] = [0, 0];

  constructor(
    container: string | Node | HTMLElement | HTMLElement[] | Node[],
    {
      pricePrecision, paddingPercents, calculateLiquidationPrice,
      calculateQuantity, getPseudoPosition, onDoubleClick,
      onUpdateDrafts, onUpdateAlerts, onClickDraftCheck, onDragLimitOrder, onCancelOrder,
    }: Params,
  ) {
    const containerElement = $.one(container);
    if (!containerElement) throw new Error('Element not found');
    this.#container = containerElement;

    const resizeData = this.#calcDimensions();

    const x = d3.scaleTime().range([0, this.#width]);

    const scales = {
      x,
      scaledX: x,
      y: localStorage.getItem('forceChartLinearScale') === 'true'
        ? d3.scaleLinear().range([this.#height, 0])
        : d3.scaleSymlog().range([this.#height, 0]),
    };

    this.#scales = scales;

    this.#pricePrecision = pricePrecision;
    this.#svg = new Svg();
    this.#axes = new Axes({ scales });
    this.#clipPath = new ClipPath();
    this.#gridLines = new GridLines({ scales });
    this.#paddingPercents = paddingPercents;
    this.#measurer = new Measurer({ scales, resizeData });
    this.#plot = new Plot({ scales });
    this.#ema = new Ema({ scales });
    this.#supertrend = new Supertrend({ scales });

    this.#orderArrows = new OrderArrows({ scales });
    this.#markPriceTriangle = new MarkPriceTriangle({ scales });

    this.#lines = new Lines({
      axis: this.#axes.getAxis(),
      calculateLiquidationPrice,
      calculateQuantity,
      getPseudoPosition,
      onUpdateAlerts,
      onUpdateDrafts,
      onClickDraftCheck,
      onDragLimitOrder,
      onCancelOrder,
      onDoubleClick,
    }, resizeData);

    this.#initialRender();

    d3.select(this.#container).select('svg').call(
      this.#zoom.on('zoom', (event: d3.D3ZoomEvent<Element, unknown>) => {
        const { transform } = event;

        this.#zoomTransform = transform;

        const scaledX = transform.rescaleX(this.#scales.x);

        this.#scales.scaledX = scaledX;

        this.#axes.update({ scaledX });
        this.#gridLines.update({ scaledX });
        this.#plot.update({ scaledX });
        this.#orderArrows.update({ scaledX });
        this.#markPriceTriangle.update({ scaledX });
        this.#ema.update({ scaledX });
        this.#supertrend.update({ scaledX });
        this.#lines.update();

        this.#draw();

        // fixes https://trello.com/c/HqXtZ5St/150-chart-wheel-zooming-doesnt-redraw-lines-where-they-should-be
        this.#lines.resize(this.#calcDimensions());
        // fixes https://trello.com/c/G4osv4DT/201-chart-measurer-isnt-redrawn-on-timeframe-switching
        this.#measurer.resize(this.#calcDimensions());
      }) as (selection: D3Selection<d3.BaseType>) => void,
    ).on('dblclick.zoom', null);

    // connect rapidly changing sources of data to the chart directly
    listenChange(store.market, 'currentSymbolMarkPrice', (markPrice) => {
      this.update({ markPrice });
    });

    listenChange(store.market, 'candles', (candles) => {
      this.update({ candles });
    });

    listenChange(store.trading, 'openPositions', (openPositions) => {
      this.update({
        position: openPositions
          .find((pos) => pos.symbol === store.persistent.symbol) ?? null,
      });
    });

    listenMultiChange(store.market, ['bids', 'asks'], ({ bids, asks }) => {
      this.update({ bids, asks });
    });

    listenMultiChange(store.trading, ['openOrders', 'ordersToBeCreated'], ({ openOrders, ordersToBeCreated }) => {
      this.update({
        orders: openOrders.filter((pos) => pos.symbol === store.persistent.symbol),
        ordersToBeCreated,
      });
    });
  }

  /**
   * The method updates chart properties but not chart data
   * @param properties - New chart properties
   */
  public update(data: {
    currentSymbolPseudoPosition?: TradingPosition | null;
    markPrice?: number;
    totalWalletBalance?: number;
    currentSymbolInfo?: api.FuturesExchangeInfoSymbol | null;
    currentSymbolLeverage?: number;
    filledOrders?: api.FuturesOrder[];
    leverageBrackets?: Record<string, api.FuturesLeverageBracket[]>;
    // not implicitly used but required for component updates
    isCurrentSymbolMarginTypeIsolated?: boolean;
    candles?: api.FuturesChartCandle[],
    position?: TradingPosition | null;
    orders?: TradingOrder[];
    alerts?: AlertItem[];
    customPriceLines?: PriceLinesDatum[];
    ordersToBeCreated?: OrderToBeCreated[];

    buyDraftPrice?: number | null;
    sellDraftPrice?: number | null;
    buyDraftSize?: number | null;
    sellDraftSize?: number | null;
    shouldShowBuyDraftPrice?: boolean;
    shouldShowSellDraftPrice?: boolean;

    stopBuyDraftPrice?: number | null;
    stopSellDraftPrice?: number | null;
    shouldShowStopBuyDraftPrice?: boolean;
    shouldShowStopSellDraftPrice?: boolean;

    shouldShowBidAskLines?: boolean;
    bids?: [number, number][];
    asks?: [number, number][];

    shouldShowEma?: [boolean, boolean, boolean, boolean];
    emaNumbers?: [number, number, number, number];
    emaColors?: [string, string, string, string];

    shouldShowSupertrend?: boolean;
    supertrendPeroid?: number;
    supertrendMultiplier?: number;
    supertrendDownTrendColor?: string;
    supertrendUpTrendColor?: string;

    paddingPercents?: ChartPaddingPercents;
  }): void {
    if (typeof data.alerts !== 'undefined') this.#lines.alertLines.updateAlertLines(data.alerts);

    if (typeof data.currentSymbolInfo !== 'undefined') {
      const pricePrecision = data.currentSymbolInfo?.pricePrecision ?? 0;

      this.#pricePrecision = pricePrecision;
      this.#axes.update({ pricePrecision });
      this.#lines.update({ pricePrecision });
      this.#markPriceTriangle.update({ pricePrecision });
    }

    if (typeof data.candles !== 'undefined') {
      const isNewSymbol = !!this.#candles.length
        && this.#candles[0]?.symbol !== data.candles[0]?.symbol;
      const isNewInterval = this.#candles[0]?.interval !== data.candles[0]?.interval;
      const isNewCandle = !isNewSymbol
        && !isNewInterval
        && this.#candles.length
        && this.#candles.length !== data.candles.length;

      const lastPrice = +(last(data.candles ?? [])?.close ?? 0);
      this.#candles = data.candles;

      if (lastPrice) {
        this.#lines.draftLines.updateDraftLines({ lastPrice });
      }

      this.#draw();

      if (isNewSymbol || isNewInterval) {
        this.#resize();
        this.#lines.update();
      } else if (isNewCandle) {
        this.#translateBy(0);
      }
    }

    if (typeof data.shouldShowBidAskLines !== 'undefined' || typeof data.bids !== 'undefined' || typeof data.asks !== 'undefined') {
      this.#lines.currentPriceLines.updateCurrentPrices(data);
    }

    if (
      typeof data.buyDraftPrice !== 'undefined'
      || typeof data.sellDraftPrice !== 'undefined'
      || typeof data.buyDraftSize !== 'undefined'
      || typeof data.sellDraftSize !== 'undefined'
      || typeof data.shouldShowBuyDraftPrice !== 'undefined'
      || typeof data.shouldShowSellDraftPrice !== 'undefined'
      || typeof data.stopBuyDraftPrice !== 'undefined'
      || typeof data.stopSellDraftPrice !== 'undefined'
      || typeof data.shouldShowStopBuyDraftPrice !== 'undefined'
      || typeof data.shouldShowStopSellDraftPrice !== 'undefined'
    ) {
      this.#lines.draftLines.updateDraftLines(data);
    }

    if (
      typeof data.position !== 'undefined' || typeof data.leverageBrackets !== 'undefined'
    ) {
      this.#lines.liquidationPriceLines.updateLiquidationLines(data);
    }

    if (typeof data.totalWalletBalance !== 'undefined') this.#measurer.update({ totalWalletBalance: data.totalWalletBalance });

    if (typeof data.currentSymbolLeverage !== 'undefined') {
      this.#measurer.update({ currentSymbolLeverage: data.currentSymbolLeverage });
    }

    if (typeof data.filledOrders !== 'undefined') {
      this.#orderArrows.update({ filledOrders: data.filledOrders });
    }

    if (typeof data.orders !== 'undefined' && typeof data.ordersToBeCreated !== 'undefined') {
      this.#measurer.update({ orders: data.orders });
      this.#lines.orderLines.updateOrderLines({
        openOrders: data.orders,
        ordersToBeCreated: data.ordersToBeCreated,
      });
    }

    if (typeof data.position !== 'undefined') {
      this.#measurer.update({ position: data.position });
      this.#lines.positionLines.updatePositionLine(data.position);
    }

    if (typeof data.customPriceLines !== 'undefined') this.#lines.customLines.update({ items: data.customPriceLines });

    if (typeof data.markPrice !== 'undefined') this.#markPriceTriangle.update({ markPrice: data.markPrice });

    if (typeof data.paddingPercents !== 'undefined' && !isEqual(data.paddingPercents, this.#paddingPercents)) {
      this.#paddingPercents = data.paddingPercents;

      this.#translateBy(
        -this.#zoomTransform.x
        + (this.#width * (-Math.min(90, Math.max(0, this.#paddingPercents.right)) / 100 || 0)),
      );

      this.#draw();
    }

    if (typeof data.emaNumbers !== 'undefined' || typeof data.shouldShowEma !== 'undefined' || typeof data.emaColors !== 'undefined') {
      this.#ema.update(data);
      this.#draw();
    }

    if (
      typeof data.shouldShowSupertrend !== 'undefined'
      || typeof data.supertrendPeroid !== 'undefined'
      || typeof data.supertrendMultiplier !== 'undefined'
      || typeof data.supertrendDownTrendColor !== 'undefined'
      || typeof data.supertrendUpTrendColor !== 'undefined'
    ) {
      this.#supertrend.update(data);
    }
  }

  /**
   * Removes SVG
   */
  public unmount(): void {
    d3.select(this.#container).select('svg').remove();
  }

  public resetAlerts = (): void => {
    this.#lines.alertLines.empty();
  };

  #draw = (): void => {
    this.#calcXDomain();
    const yDomain = this.#calcYDomain();
    const resizeData: ResizeData = {
      width: this.#width, height: this.#height, margin: this.#margin, scales: this.#scales,
    };

    const drawData: DrawData = { candles: this.#candles, zoomTransform: this.#zoomTransform };

    this.#axes.draw(resizeData);
    this.#gridLines.draw();
    this.#plot.draw(drawData);
    this.#orderArrows.draw();
    this.#ema.draw(drawData);
    this.#supertrend.draw(drawData);

    // fixes https://trello.com/c/tLjFqdCB/230-chart-order-and-alert-lines-are-not-redrawn-on-price-ath-atl
    if (!isEqual(this.#yDomain, yDomain)) {
      this.#lines.resize(resizeData);
      this.#yDomain = yDomain;
    }

    this.#lines.currentPriceLines.updateCurrentPrices({
      lastPrice: +(this.#candles[this.#candles.length - 1]?.close ?? 0),
    });

    if (!this.#hasInitialScroll && this.#candles.length) {
      this.#hasInitialScroll = true;
      this.#translateBy(
        this.#width * (-Math.min(90, Math.max(0, this.#paddingPercents.right)) / 100 || 0),
      );
    }
  };

  #translateBy = (value: number): void => {
    d3.select(this.#container).select('svg').call(
      this.#zoom.translateBy as ZooomTranslateBy, value,
    );
  };

  #resize = (): void => {
    const resizeData: ResizeData = this.#calcDimensions();
    this.#svg.resize(resizeData);
    this.#scales.x.range([0, this.#width]);
    this.#scales.y.range([this.#height, 0]);
    this.#axes.resize(resizeData);
    this.#clipPath.resize(resizeData);
    this.#gridLines.resize(resizeData);
    this.#lines.resize(resizeData);
    this.#measurer.resize(resizeData);
    this.#ema.resize();
    this.#supertrend.resize();

    if (this.#candles.length) {
      this.#draw();
      this.#translateBy(0);
    }
  };

  #initialRender = (): void => {
    const resizeData: ResizeData = {
      width: this.#width, height: this.#height, margin: this.#margin, scales: this.#scales,
    };
    //  Order of appending = visual z-order (last is top)
    const svgContainer = this.#svg.appendTo(this.#container, resizeData);

    this.#gridLines.appendTo(svgContainer, resizeData);
    this.#axes.appendTo(svgContainer, resizeData);
    this.#ema.appendTo(svgContainer);
    this.#supertrend.appendTo(svgContainer);
    this.#plot.appendTo(svgContainer);
    this.#clipPath.appendTo(svgContainer, resizeData);
    this.#orderArrows.appendTo(svgContainer);
    this.#lines.appendTo(svgContainer, resizeData);
    this.#measurer.appendTo(svgContainer, resizeData);
    this.#markPriceTriangle.appendTo(svgContainer);

    new ResizeObserver(() => this.#resize()).observe(this.#container);
  };

  #calcDimensions = (): ResizeData => {
    this.#width = this.#container.offsetWidth - this.#margin.left - this.#margin.right;
    this.#height = this.#container.offsetHeight - this.#margin.top - this.#margin.bottom;

    return {
      width: this.#width, height: this.#height, margin: this.#margin, scales: this.#scales,
    };
  };

  #calcXDomain = (): void => {
    const candles = this.#candles
      .slice(-Math.round(this.#width / 3), this.#candles.length);
    const xDomain = (candles.length)
      ? [candles[0].time, last(candles)?.time]
      : [new Date(0), new Date()];
    this.#scales.x.domain(xDomain as Iterable<Date | d3.NumberValue>);
  };

  #calcYDomain = (): [number, number] => {
    const { y } = this.#scales;
    const xDomain = this.#scales.scaledX.domain();
    const candles = this.#candles.filter((x) => x.time >= xDomain[0].getTime()
          && x.time <= xDomain[1].getTime());

    const yDomain: [number, number] = candles.length
      ? [d3.min(candles, (d) => +d.low) as number, d3.max(candles, (d) => +d.high) as number]
      : [0, 1];

    if ('constant' in y && yDomain[0] !== 0) {
      if (yDomain[0] < 1) y.constant(0.1);
      if (yDomain[0] < 0.1) y.constant(0.01);
      if (yDomain[0] < 0.01) y.constant(0.001);
    }

    const paddingTopPercent = Math.min(50, Math.max(0, this.#paddingPercents.top)) || 0;
    const paddingBottomPercent = Math.min(50, Math.max(0, this.#paddingPercents.bottom)) || 0;
    const paddingTop = this.#height * (paddingTopPercent / 100);
    const paddingBottom = (this.#height * (paddingBottomPercent / 100));

    // calc domain before and after calculating padding
    y.domain(yDomain);

    // Padding
    const yPaddingTop = y.invert(-paddingTop) - y.invert(0);
    const yPaddingBottom = y.invert(this.#height)
      - y.invert(this.#height + paddingBottom);

    yDomain[1] = (yDomain[1] ?? 0) + (+yPaddingTop.toFixed(this.#pricePrecision));
    yDomain[0] = (yDomain[0] ?? 0) - (+yPaddingBottom.toFixed(this.#pricePrecision));

    y.domain(yDomain);

    return yDomain;
  };
}
