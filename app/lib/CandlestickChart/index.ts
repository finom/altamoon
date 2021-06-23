import $ from 'balajs';
import * as d3 from 'd3';

import { last } from 'lodash';
import * as api from '../../api';
import Axes from './items/Axes';
import ClipPath from './items/ClipPath';
import GridLines from './items/GridLines';
import Plot from './items/Plot';
import Svg from './items/Svg';

import './chart.global.css';

import {
  ResizeData, DrawData, Scales, StyleMargin, D3Selection, PriceLinesDatum,
} from './types';
import PriceLines from './items/PriceLines';
import { TradingPosition } from '../../store/types';
import { OrderSide } from '../../api';
import DraftPriceLines from './items/DraftPriceLines';

type ZooomTranslateBy = () => d3.Selection<d3.BaseType, unknown, null, undefined>;

interface Params {
  symbol: string;
  onUpdateAlerts: (d: number[]) => void;
  onUpdateDrafts: (d: { buyDraftPrice: number | null; sellDraftPrice: number | null; }) => void;
  alerts: number[];
  draftPriceItems: PriceLinesDatum[];
  interval: string;
  pricePrecision: number;
}

export default class CandlestickChart {
  #symbol: string;

  #interval: string;

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

  #scales: Scales;

  #container: HTMLElement;

  #currentPriceLines: PriceLines;

  #crosshairPriceLines: PriceLines;

  #alertLines: PriceLines;

  #positionLines: PriceLines;

  #draftLines: DraftPriceLines;

  #lastPrice?: number;

  #pricePrecision: number;

  #isDrawn = false;

  #candles: api.FuturesChartCandle[] = [];

  #zoom = d3.zoom();

  #onUpdateDrafts: Params['onUpdateDrafts'];

  #canCreateDraftLines = true;

  constructor(
    container: string | Node | HTMLElement | HTMLElement[] | Node[],
    {
      pricePrecision, symbol, interval, alerts, onUpdateAlerts, onUpdateDrafts,
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
      y: d3.scaleSymlog().range([this.#height, 0]),
    };

    this.#symbol = symbol;
    this.#interval = interval;
    this.#pricePrecision = pricePrecision;
    this.#svg = new Svg();
    this.#axes = new Axes({ scales: this.#scales });
    this.#clipPath = new ClipPath();
    this.#gridLines = new GridLines({ scales: this.#scales });

    this.#currentPriceLines = new PriceLines({
      axis: this.#axes.getAxis(),
      items: [{ id: 'currentPrice' }],
      color: '#0000ff',
      pointerEventsNone: true,
    }, resizeData);

    this.#crosshairPriceLines = new PriceLines({
      axis: this.#axes.getAxis(),
      items: [{ id: 'crosshair', isVisible: false }],
      showX: true,
      color: '#3F51B5',
      lineStyle: 'dotted',
      pointerEventsNone: true,
    }, resizeData);

    this.#alertLines = new PriceLines({
      axis: this.#axes.getAxis(),
      items: alerts.map((yValue) => ({ yValue, title: 'Alert' })),
      color: '#828282',
      isTitleVisible: true,
      isDraggable: true,
      lineStyle: 'dashed',
      onDragEnd: (_datum, d) => onUpdateAlerts?.(d.map(({ yValue }) => yValue ?? -1)),
      onClickTitle: (datum, d) => this.#alertLines.removeItem(d.indexOf(datum)),
    }, resizeData);

    this.#positionLines = new PriceLines({
      axis: this.#axes.getAxis(),
      items: [{ id: 'position', isVisible: false }],
      isTitleVisible: true,
    }, resizeData);

    this.#draftLines = new DraftPriceLines({
      axis: this.#axes.getAxis(),
      onDragEnd: onUpdateDrafts,
      onClickTitle: onUpdateDrafts,
    }, resizeData);

    this.#onUpdateDrafts = onUpdateDrafts;

    this.#plot = new Plot({ scales: this.#scales });

    this.#initialRender();

    type ZoomEvent = { transform: { rescaleX: (s: Scales['x']) => Scales['x'] } };

    d3.select(this.#container).select('svg').call(
      this.#zoom.on('zoom', (event: ZoomEvent) => {
        const { transform } = event;
        const scaledX = transform.rescaleX(this.#scales.x);

        this.#scales.scaledX = scaledX;

        this.#axes.update({ scaledX });
        this.#gridLines.update({ scaledX });
        this.#plot.update({ scaledX });

        this.#draw();
      }) as (selection: D3Selection<d3.BaseType>) => void,
    );
  }

  /**
   * The method updates chart properties but not chart data
   * @param properties - New chart properties
   */
  public update(data: {
    pricePrecision?: number;
    candles?: api.FuturesChartCandle[],
    symbol?: string;
    interval?: string;
    position?: TradingPosition | null;
    buyDraftPrice?: number | null;
    sellDraftPrice?: number | null;
    shouldShowBuyPrice?: boolean;
    shouldShowSellPrice?: boolean;
    canCreateDraftLines?: boolean;
  }): void {
    if (typeof data.pricePrecision !== 'undefined' && data.pricePrecision !== this.#pricePrecision) {
      const { pricePrecision } = data;
      this.#pricePrecision = pricePrecision;
      this.#axes.update({ pricePrecision });
      this.#currentPriceLines.update({ pricePrecision });
      this.#crosshairPriceLines.update({ pricePrecision });
      this.#alertLines.update({ pricePrecision });
      this.#draftLines.update({ pricePrecision });
      this.#positionLines.update({ pricePrecision });
    }

    if (typeof data.candles !== 'undefined') {
      this.#candles = data.candles;
      const lastPrice = +(last(data.candles ?? [])?.close ?? 0);
      if (lastPrice) {
        this.#checkAlerts(lastPrice);
        this.#lastPrice = lastPrice;
      }
    }

    if (typeof data.symbol !== 'undefined' && this.#symbol !== data.symbol) {
      this.#symbol = data.symbol;
      this.#alertLines.empty();
    }

    if (typeof data.candles !== 'undefined' || typeof data.interval !== 'undefined') {
      this.#draw();
    }

    if (typeof data.interval !== 'undefined' && this.#interval !== data.interval) {
      this.#translateBy(0);
    }

    if (typeof data.buyDraftPrice !== 'undefined') this.#draftLines.updateItem('BUY', { yValue: data.buyDraftPrice ?? 0 });
    if (typeof data.sellDraftPrice !== 'undefined') this.#draftLines.updateItem('SELL', { yValue: data.sellDraftPrice ?? 0 });
    if (typeof data.shouldShowBuyPrice !== 'undefined') this.#draftLines.updateItem('BUY', { isVisible: data.shouldShowBuyPrice });
    if (typeof data.shouldShowSellPrice !== 'undefined') this.#draftLines.updateItem('SELL', { isVisible: data.shouldShowSellPrice });
    if (typeof data.canCreateDraftLines !== 'undefined') this.#canCreateDraftLines = data.canCreateDraftLines;

    if (typeof data.position !== 'undefined') {
      if (data.position === null) {
        this.#positionLines.updateItem('position', { isVisible: false });
      } else {
        this.#positionLines.updateItem('position', {
          isVisible: true,
          yValue: data.position.entryPrice,
          color: data.position.side === 'BUY' ? 'var(--biduul-buy-color)' : 'var(--biduul-sell-color)',
          title: `${data.position.positionAmt} ${data.position.baseAsset}`,
        });
      }
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

    const drawData: DrawData = { candles: this.#candles };

    this.#axes.draw(resizeData);

    this.#gridLines.draw();

    /*

    this.priceLine.draw(this.data.priceLine)
    this.breakEvenLine.draw(this.data.breakEvenLine)
    this.positionLine.draw(this.data.positionLine)
    this.bidAskLines.draw(this.data.bidAskLines)
    this.liquidationLine.draw(this.data.liquidationLine)
    this.orderLines.draw(this.data.orderLines).draggable()
    this.draftLines.draw(this.data.draftLines).draggable()
    this.alertLines.draw(this.data.alertLines).draggable()

    this.positionLabel.draw(this.data.positionLine)
    this.orderLabels.draw(this.data.orderLines)
    this.draftLabels.draw(this.data.draftLines)
    this.alertLabels.draw(this.data.alertLines)
    */

    this.#plot.draw(drawData);

    this.#currentPriceLines.updateItem('currentPrice', {
      yValue: +(this.#candles[this.#candles.length - 1]?.close ?? 0),
    });

    if (!this.#isDrawn && this.#candles.length) {
      this.#isDrawn = true;
      this.#translateBy(-100);
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
    this.#crosshairPriceLines.resize(resizeData);
    this.#alertLines.resize(resizeData);
    this.#draftLines.resize(resizeData);

    /*
    this.priceLine.resize()
    this.bidAskLines.resize()
    this.draftLines.resize()
    this.alertLines.resize()
    this.orderLines.resize()
    this.breakEvenLine.resize()
    this.positionLine.resize()
    this.liquidationLine.resize()
    */
    // this.#crosshair.resize(resizeData);

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
    this.#alertLines.appendTo(svgContainer, resizeData);
    this.#draftLines.appendTo(svgContainer, resizeData);
    this.#positionLines.appendTo(svgContainer, resizeData);

    /*
     this.svg.appendTo(this.containerId)

     this.clipPath.appendTo(this.svg, 'clipChart')

     this.gridLines.appendTo(this.svg)

     this.axes.appendTo(this.svg)

     this.breakEvenLine.appendTo(this.svg, 'break-even-line')
     this.positionLine.appendTo(this.svg, 'position-line')
     this.liquidationLine.appendTo(this.svg, 'liquidation-line')
     this.bidAskLines.appendTo(this.svg, 'bid-ask-lines')
     this.priceLine.appendTo(this.svg, 'price-line')

     this.plot.appendTo(this.svg)

     this.measurer.appendTo(this.svg, 'measurer')
    */

    // this.#crosshair.appendTo(svgContainer);
    /*
     this.orderLines.appendTo(this.svg, 'order-lines')
     this.draftLines.appendTo(this.svg, 'draft-lines')
     this.alertLines.appendTo(this.svg, 'alert-lines')

     this.positionLabel.appendTo(this.svg, 'position-label')
     this.orderLabels.appendTo(this.svg, 'order-labels')
     this.draftLabels.appendTo(this.svg, 'draft-labels')
     this.alertLabels.appendTo(this.svg, 'alert-labels')
     */

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

    // Padding
    const yPaddingTop = y.invert(-200) - y.invert(0);
    const yPaddingBot = y.invert(this.#height) - y.invert(this.#height + 200);

    yDomain[1] = (yDomain[1] ?? 0) + (+yPaddingTop.toFixed(this.#pricePrecision));
    yDomain[0] = (yDomain[0] ?? 0) - (+yPaddingBot.toFixed(this.#pricePrecision));

    y.domain(yDomain);
  };

  #checkAlerts = (lastPrice: number): void => {
    const previousLastPrice = this.#lastPrice;
    const items = this.#alertLines.getItems();

    if (lastPrice && previousLastPrice) {
      const up = items.find(
        ({ yValue }) => yValue && lastPrice >= yValue && previousLastPrice < yValue,
      );
      const down = items.find(
        ({ yValue }) => yValue && lastPrice <= yValue && previousLastPrice > yValue,
      );
      if (up) {
        void new Audio('../assets/audio/alert-up.mp3').play();
        this.#alertLines.removeItem(items.indexOf(up));
      } else if (down) {
        void new Audio('../assets/audio/alert-down.mp3').play();
        this.#alertLines.removeItem(items.indexOf(down));
      }
    }
  };

  #onRightClick = (event: MouseEvent): void => {
    event.stopPropagation();
    event.preventDefault();

    const coords = d3.pointer(event);

    this.#alertLines.addItem({
      yValue: this.#crosshairPriceLines.invertY(coords[1]),
      title: 'Alert',
    });
  };

  #onDoubleClick = (event: MouseEvent): void => {
    event.stopPropagation();
    event.preventDefault();

    if (!this.#canCreateDraftLines) return;

    const coords = d3.pointer(event);
    const yValue = this.#draftLines.invertY(coords[1]);
    const lastPrice: number = this.#currentPriceLines.getItems()[0]?.yValue ?? 0;
    const side: OrderSide = yValue < lastPrice ? 'BUY' : 'SELL';

    this.#draftLines.updateItem(side, { yValue, isVisible: true });

    this.#onUpdateDrafts(this.#draftLines.getDraftPrices());
  };

  #onMouseMove = (event: MouseEvent): void => {
    const coords = d3.pointer(event);

    this.#crosshairPriceLines.updateItem('crosshair', {
      isVisible: true,
      xValue: this.#crosshairPriceLines.invertX(coords[0]),
      yValue: this.#crosshairPriceLines.invertY(coords[1]),
    });
  };

  #onMouseLeave = (): void => {
    this.#crosshairPriceLines.updateItem('crosshair', { isVisible: false });
  };
}
