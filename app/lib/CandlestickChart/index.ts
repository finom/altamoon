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
  ResizeData, DrawData, Scales, StyleMargin, D3Selection,
} from './types';
import PriceLines from './items/PriceLines';

type ZooomTranslateBy = () => d3.Selection<d3.BaseType, unknown, null, undefined>;

interface Params {
  symbol: string;
  onUpdateAlerts: (y: number[]) => void;
  alerts: number[];
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

  #lastPrice?: number;

  #pricePrecision: number;

  #isDrawn = false;

  #candles: api.FuturesChartCandle[] = [];

  /* #data = {
    candles: [] as FuturesChartCandle[],
    positionLine: [],
    bidAskLines: [],
    liquidationLine: [],
    breakEvenLine: [],
    orderLines: [],
    draftLines: [],
    alertLines: [],
    pricePrecision: 1,
  }; */

  #zoom = d3.zoom();

  constructor(
    container: string | Node | HTMLElement | HTMLElement[] | Node[],
    {
      pricePrecision, symbol, interval, alerts, onUpdateAlerts,
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
      items: [{}],
      color: '#0000ff',
    }, resizeData);

    this.#crosshairPriceLines = new PriceLines({
      axis: this.#axes.getAxis(),
      items: [],
      showX: true,
      isVisible: false,
      color: '#3F51B5',
      lineStyle: 'dotted',
    }, resizeData);

    this.#alertLines = new PriceLines({
      axis: this.#axes.getAxis(),
      items: alerts.map((yValue) => ({ yValue, title: 'Alert' })),
      color: '#828282',
      isTitleVisible: true,
      isDraggable: true,
      lineStyle: 'dashed',
      onUpdate: onUpdateAlerts,
    }, resizeData);

    // console.log(this.#axes.getAxis().yRight.tickSizeInner());
    /* this.#crosshair = new Crosshair({
      axis: this.#axes.getAxis(),
      resizeData,
      scales: this.#scales,
    }); */
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
    pricePrecision?: number; candles?: api.FuturesChartCandle[], symbol?: string; interval?: string;
  }): void {
    if (typeof data.pricePrecision !== 'undefined' && data.pricePrecision !== this.#pricePrecision) {
      this.#pricePrecision = data.pricePrecision;
      this.#axes.update({ pricePrecision: data.pricePrecision });
      this.#currentPriceLines.update({ pricePrecision: data.pricePrecision });
      this.#crosshairPriceLines.update({ pricePrecision: data.pricePrecision });
      this.#alertLines.update({ pricePrecision: data.pricePrecision });
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
      this.#alertLines.update({ items: [] });
    }

    if (typeof data.candles !== 'undefined' || typeof data.interval !== 'undefined') {
      this.#draw();
    }

    if (typeof data.interval !== 'undefined' && this.#interval !== data.interval) {
      this.#translateBy(0);
    }
  }

  /**
   * Removes SVG
   */
  public unmount(): void {
    d3.select(this.#container).select('svg').remove();
  }

  public resetAlerts = (): void => {
    this.#alertLines.update({ items: [] });
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

    this.#currentPriceLines.updateItem(0, {
      yValue: +(
        this.#candles[this.#candles.length - 1]?.close ?? 0
      ),
    });

    // this.#crosshair.draw();

    /*

        // Color lines based on market side
        this.positionLine.wrapper.selectAll('.position-line > g')
            .attr('data-side', d => d.side)
        this.orderLines.wrapper.selectAll('.order-lines > g')
            .attr('data-side', d => d.side)
        this.draftLines.wrapper.selectAll('.draft-lines > g')
            .attr('data-side', d => d.side)
        this.alertLines.wrapper.selectAll('.alert-lines > g')
            .attr('data-side', d => d.side)
    */
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
    this.#crosshairPriceLines.resize(resizeData);
    this.#alertLines.resize(resizeData);

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
    this.#currentPriceLines.appendTo(svgContainer, resizeData, { wrapperCSSStyle: { pointerEvents: 'none' } });
    this.#alertLines.appendTo(svgContainer, resizeData);

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
      .on('dblclick', this.#onDoubleClick);
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
    const xDomain = this.#scales.x.domain();
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
        this.#alertLines.removeItem(up);
      } else if (down) {
        void new Audio('../assets/audio/alert-down.mp3').play();
        this.#alertLines.removeItem(down);
      }
    }
  };

  #onDoubleClick = (event: MouseEvent): void => {
    event.stopPropagation();
    const coords = d3.pointer(event);

    this.#alertLines.addItem({
      yValue: this.#crosshairPriceLines.invertY(coords[1]),
      title: 'Alert',
    });
  };

  #onMouseMove = (event: MouseEvent): void => {
    const coords = d3.pointer(event);

    this.#crosshairPriceLines.update({
      isVisible: true,
    });

    this.#crosshairPriceLines.updateItem(0, {
      xValue: this.#crosshairPriceLines.invertX(coords[0]),
      yValue: this.#crosshairPriceLines.invertY(coords[1]),
    });
  };

  #onMouseLeave = (): void => {
    this.#crosshairPriceLines.update({
      isVisible: false,
    });
  };
}
