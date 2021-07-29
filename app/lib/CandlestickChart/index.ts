import $ from 'balajs';
import * as d3 from 'd3';

import { isEqual, last } from 'lodash';
import * as api from '../../api';
import Axes from './items/Axes';
import ClipPath from './items/ClipPath';
import GridLines from './items/GridLines';
import Plot from './items/Plot';
import Svg from './items/Svg';

import './chart.global.css';

import {
  ResizeData, DrawData, Scales, StyleMargin, D3Selection, PriceLinesDatum, ChartPaddingPercents,
} from './types';
import PriceLines from './items/PriceLines';
import { TradingOrder, TradingPosition } from '../../store/types';
import { OrderSide } from '../../api';
import DraftPriceLines from './items/DraftPriceLines';
import OrderPriceLines from './items/OrderPriceLines';
import AlertPriceLines from './items/AlertPriceLines';
import PositionPriceLines from './items/PositionPriceLines';
import CrosshairPriceLines from './items/CrosshairPriceLines';
import Measurer from './items/Measurer';
import CustomPriceLines from './items/CustomPriceLines';

type ZooomTranslateBy = () => d3.Selection<d3.BaseType, unknown, null, undefined>;

interface Params {
  onUpdateAlerts: (d: number[]) => void;
  onUpdateDrafts: (d: {
    buyDraftPrice: number | null;
    sellDraftPrice: number | null;
    stopBuyDraftPrice: number | null;
    stopSellDraftPrice: number | null;
  }) => void;
  onClickDraftCheck: (d: {
    buyDraftPrice: number | null;
    sellDraftPrice: number | null;
    stopBuyDraftPrice: number | null;
    stopSellDraftPrice: number | null;
  }, side: OrderSide) => void;
  onDragLimitOrder: (orderId: number, price: number) => void;
  onCancelOrder: (orderId: number) => void;
  alerts: number[];
  draftPriceItems: PriceLinesDatum[];
  pricePrecision: number;
  paddingPercents: ChartPaddingPercents;
}

export default class CandlestickChart {
  #svg: Svg;

  #clipPath: ClipPath;

  #axes: Axes;

  #gridLines: GridLines;

  #plot: Plot;

  #width = 0;

  #height = 0;

  #margin: StyleMargin = {
    top: 0, right: 55, bottom: 30, left: 55,
  };

  #paddingPercents: ChartPaddingPercents;

  #scales: Scales;

  #container: HTMLElement;

  #currentPriceLines: PriceLines;

  #crosshairPriceLines: CrosshairPriceLines;

  #alertLines: AlertPriceLines;

  #positionLines: PositionPriceLines;

  #orderLines: OrderPriceLines;

  #draftLines: DraftPriceLines;

  #customLines: CustomPriceLines;

  #measurer: Measurer;

  #pricePrecision: number;

  #hasInitialScroll = false;

  #candles: api.FuturesChartCandle[] = [];

  #zoom = d3.zoom();

  #onUpdateDrafts: Params['onUpdateDrafts'];

  #canCreateDraftLines = true;

  #zoomTransform: Pick<d3.ZoomTransform, 'x' | 'y' | 'k'> = { k: 1, x: 0, y: 0 };

  constructor(
    container: string | Node | HTMLElement | HTMLElement[] | Node[],
    {
      pricePrecision, alerts, paddingPercents, onUpdateAlerts, onUpdateDrafts,
      onClickDraftCheck, onDragLimitOrder, onCancelOrder,
    }: Params,
  ) {
    const containerElement = $.one(container);
    if (!containerElement) {
      throw new Error('Element not found');
    }
    this.#container = containerElement;

    const resizeData = this.#calcDimensions();

    const x = d3.scaleTime().range([0, this.#width]);

    this.#scales = {
      x,
      scaledX: x,
      y: localStorage.getItem('forceChartLinearScale') === 'true'
        ? d3.scaleLinear().range([this.#height, 0])
        : d3.scaleSymlog().range([this.#height, 0]),
    };

    this.#pricePrecision = pricePrecision;
    this.#svg = new Svg();
    this.#axes = new Axes({ scales: this.#scales });
    this.#clipPath = new ClipPath();
    this.#gridLines = new GridLines({ scales: this.#scales });
    this.#paddingPercents = paddingPercents;

    this.#currentPriceLines = new PriceLines({
      axis: this.#axes.getAxis(),
      items: [{ id: 'currentPrice' }],
      color: '#0000ff',
      pointerEventsNone: true,
    }, resizeData);

    this.#crosshairPriceLines = new CrosshairPriceLines({ axis: this.#axes.getAxis() }, resizeData);

    this.#alertLines = new AlertPriceLines({
      axis: this.#axes.getAxis(),
      alerts,
      onUpdateAlerts,
    }, resizeData);

    this.#positionLines = new PositionPriceLines({ axis: this.#axes.getAxis() }, resizeData);

    this.#draftLines = new DraftPriceLines({
      axis: this.#axes.getAxis(),
      onUpdateDrafts,
      onClickDraftCheck,
    }, resizeData);

    this.#orderLines = new OrderPriceLines({
      axis: this.#axes.getAxis(),
      onDragLimitOrder,
      onCancelOrder,
    }, resizeData);

    this.#customLines = new CustomPriceLines({
      axis: this.#axes.getAxis(),
    }, resizeData);

    this.#measurer = new Measurer({ scales: this.#scales, resizeData });

    this.#onUpdateDrafts = onUpdateDrafts;

    this.#plot = new Plot({ scales: this.#scales });

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
        this.#positionLines.update();
        this.#alertLines.update();
        this.#customLines.update();
        this.#orderLines.update();
        this.#draftLines.update();
        this.#currentPriceLines.update();

        this.#draw();
      }) as (selection: D3Selection<d3.BaseType>) => void,
    );
  }

  /**
   * The method updates chart properties but not chart data
   * @param properties - New chart properties
   */
  public update(data: {
    totalWalletBalance?: number;
    currentSymbolInfo?: api.FuturesExchangeInfoSymbol | null;
    currentSymbolLeverage?: number;
    candles?: api.FuturesChartCandle[],
    position?: TradingPosition | null;
    orders?: TradingOrder[];
    alerts?: number[];
    customPriceLines?: PriceLinesDatum[];

    buyDraftPrice?: number | null;
    sellDraftPrice?: number | null;
    shouldShowBuyPrice?: boolean;
    shouldShowSellPrice?: boolean;

    stopBuyDraftPrice?: number | null;
    stopSellDraftPrice?: number | null;
    shouldShowStopBuyPrice?: boolean;
    shouldShowStopSellPrice?: boolean;

    canCreateDraftLines?: boolean;

    paddingPercents?: ChartPaddingPercents;
  }): void {
    if (typeof data.currentSymbolInfo !== 'undefined') {
      const pricePrecision = data.currentSymbolInfo?.pricePrecision ?? 0;

      this.#pricePrecision = pricePrecision;
      this.#axes.update({ pricePrecision });
      this.#currentPriceLines.update({ pricePrecision });
      this.#crosshairPriceLines.update({ pricePrecision });
      this.#alertLines.update({ pricePrecision });
      this.#customLines.update({ pricePrecision });
      this.#draftLines.update({ pricePrecision });
      this.#positionLines.update({ pricePrecision });
      this.#orderLines.update({ pricePrecision });
    }

    if (typeof data.candles !== 'undefined') {
      const isNewSymbol = !!this.#candles.length
        && this.#candles[0]?.symbol !== data.candles[0]?.symbol;
      const isNewInterval = this.#candles[0]?.interval !== data.candles[0]?.interval;
      this.#candles = data.candles;
      const lastPrice = +(last(data.candles ?? [])?.close ?? 0);

      if (lastPrice) {
        if (isNewSymbol) {
          this.#alertLines.update({ lastPrice });
        }

        this.#alertLines.checkAlerts(lastPrice);
      }

      this.#draw();

      if (isNewSymbol || isNewInterval) {
        this.#resize();
        this.#positionLines.update();
        this.#alertLines.update();
        this.#customLines.update();
        this.#orderLines.update();
        this.#draftLines.update();
        this.#currentPriceLines.update();
      }
    }

    if (typeof data.buyDraftPrice !== 'undefined') this.#draftLines.updateItem('BUY', { yValue: data.buyDraftPrice ?? 0 });
    if (typeof data.sellDraftPrice !== 'undefined') this.#draftLines.updateItem('SELL', { yValue: data.sellDraftPrice ?? 0 });
    if (typeof data.shouldShowBuyPrice !== 'undefined') this.#draftLines.updateItem('BUY', { isVisible: data.shouldShowBuyPrice });
    if (typeof data.shouldShowSellPrice !== 'undefined') this.#draftLines.updateItem('SELL', { isVisible: data.shouldShowSellPrice });

    if (typeof data.stopBuyDraftPrice !== 'undefined') this.#draftLines.updateItem('STOP_BUY', { yValue: data.stopBuyDraftPrice ?? 0 });
    if (typeof data.stopSellDraftPrice !== 'undefined') this.#draftLines.updateItem('STOP_SELL', { yValue: data.stopSellDraftPrice ?? 0 });
    if (typeof data.shouldShowStopBuyPrice !== 'undefined') this.#draftLines.updateItem('STOP_BUY', { isVisible: data.shouldShowStopBuyPrice });
    if (typeof data.shouldShowStopSellPrice !== 'undefined') this.#draftLines.updateItem('STOP_SELL', { isVisible: data.shouldShowStopSellPrice });

    if (typeof data.canCreateDraftLines !== 'undefined') this.#canCreateDraftLines = data.canCreateDraftLines;

    if (typeof data.totalWalletBalance !== 'undefined') this.#measurer.update({ totalWalletBalance: data.totalWalletBalance });

    if (typeof data.currentSymbolLeverage !== 'undefined') this.#measurer.update({ currentSymbolLeverage: data.currentSymbolLeverage });

    if (typeof data.orders !== 'undefined') {
      this.#measurer.update({ orders: data.orders });
      this.#orderLines.updateOrderLines(data.orders);
    }

    if (typeof data.position !== 'undefined') {
      this.#measurer.update({ position: data.position });
      this.#positionLines.updatePositionLine(data.position);
    }

    if (typeof data.orders !== 'undefined') this.#orderLines.updateOrderLines(data.orders);

    if (typeof data.alerts !== 'undefined') this.#alertLines.updateAlertLines(data.alerts);

    if (typeof data.customPriceLines !== 'undefined') this.#customLines.update({ items: data.customPriceLines });

    if (typeof data.paddingPercents !== 'undefined' && !isEqual(data.paddingPercents, this.#paddingPercents)) {
      this.#paddingPercents = data.paddingPercents;

      this.#translateBy(
        -this.#zoomTransform.x
        + (this.#width * (-Math.min(90, Math.max(0, this.#paddingPercents.right)) / 100 || 0)),
      );

      this.#draw();
    }
  }

  /**
   * Removes SVG
   */
  public unmount(): void {
    d3.select(this.#container).select('svg').remove();
  }

  public resetAlerts = (): void => {
    this.#alertLines.empty();
  };

  #draw = (): void => {
    this.#calcXDomain();
    this.#calcYDomain();
    const resizeData: ResizeData = {
      width: this.#width, height: this.#height, margin: this.#margin, scales: this.#scales,
    };

    const drawData: DrawData = { candles: this.#candles, zoomTransform: this.#zoomTransform };

    this.#axes.draw(resizeData);

    this.#gridLines.draw();

    this.#plot.draw(drawData);

    this.#currentPriceLines.updateItem('currentPrice', {
      yValue: +(this.#candles[this.#candles.length - 1]?.close ?? 0),
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
    this.#currentPriceLines.resize(resizeData);
    this.#positionLines.resize(resizeData);
    this.#orderLines.resize(resizeData);
    this.#crosshairPriceLines.resize(resizeData);
    this.#alertLines.resize(resizeData);
    this.#draftLines.resize(resizeData);
    this.#customLines.resize(resizeData);

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
    this.#plot.appendTo(svgContainer);
    this.#crosshairPriceLines.appendTo(svgContainer, resizeData);
    this.#clipPath.appendTo(svgContainer, resizeData);
    this.#currentPriceLines.appendTo(svgContainer, resizeData);
    this.#positionLines.appendTo(svgContainer, resizeData);
    this.#orderLines.appendTo(svgContainer, resizeData);
    this.#draftLines.appendTo(svgContainer, resizeData);
    this.#alertLines.appendTo(svgContainer, resizeData);
    this.#customLines.appendTo(svgContainer, resizeData);
    this.#measurer.appendTo(svgContainer, resizeData);

    new ResizeObserver(() => this.#resize()).observe(this.#container);

    d3.select(this.#container).select('svg #plotMouseEventsArea')
      .on('mousemove', this.#onMouseMove)
      .on('mouseleave', this.#onMouseLeave)
      .on('dblclick', this.#onDoubleClick)
      .on('contextmenu', this.#onRightClick);
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

  #calcYDomain = (): void => {
    const { y } = this.#scales;
    const xDomain = this.#scales.scaledX.domain();
    const candles = this.#candles.filter((x) => x.time >= xDomain[0].getTime()
          && x.time <= xDomain[1].getTime());

    const yDomain: [number, number] = candles.length
      ? [d3.min(candles, (d) => +d.low) as number, d3.max(candles, (d) => +d.high) as number]
      : [0, 1];

    y.domain(yDomain);

    const paddingTopPercent = Math.min(50, Math.max(0, this.#paddingPercents.top)) || 0;
    const paddingBottomPercent = Math.min(50, Math.max(0, this.#paddingPercents.bottom)) || 0;
    const paddingTop = this.#height * (paddingTopPercent / 100);
    const paddingBottom = (this.#height * (paddingBottomPercent / 100));

    // Padding
    const yPaddingTop = y.invert(-paddingTop) - y.invert(0);
    const yPaddingBottom = y.invert(this.#height)
      - y.invert(this.#height + paddingBottom);

    yDomain[1] = (yDomain[1] ?? 0) + (+yPaddingTop.toFixed(this.#pricePrecision));
    yDomain[0] = (yDomain[0] ?? 0) - (+yPaddingBottom.toFixed(this.#pricePrecision));

    y.domain(yDomain);
  };

  #onRightClick = (evt: MouseEvent): void => {
    evt.stopPropagation();
    evt.preventDefault();

    const coords = d3.pointer(evt);

    this.#alertLines.addItem({
      yValue: this.#crosshairPriceLines.invertY(coords[1]),
      title: 'Alert',
      isDraggable: true,
    });
  };

  #onDoubleClick = (evt: MouseEvent): void => {
    evt.stopPropagation();
    evt.preventDefault();

    if (!this.#canCreateDraftLines) return;

    const coords = d3.pointer(evt);
    const yValue = this.#draftLines.invertY(coords[1]);
    const lastPrice: number = this.#currentPriceLines.getItems()[0]?.yValue ?? 0;
    const side: OrderSide = yValue < lastPrice ? 'BUY' : 'SELL';

    this.#draftLines.updateItem(side, { yValue, isVisible: true });

    this.#onUpdateDrafts(this.#draftLines.getDraftPrices());
  };

  #onMouseMove = (evt: MouseEvent): void => {
    const [x, y] = d3.pointer(evt);

    this.#crosshairPriceLines.show(x, y);
  };

  #onMouseLeave = (): void => {
    this.#crosshairPriceLines.hide();
  };
}
