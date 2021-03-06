import * as d3 from 'd3';
import { isEqual } from 'lodash';

import {
  ChartItem, D3Selection, DrawData, Scales,
} from '../types';
import * as api from '../../../../../api';

export default class Plot implements ChartItem {
  #lastCandle?: api.FuturesChartCandle;

  #zoomTransform?: Pick<d3.ZoomTransform, 'k' | 'x' | 'y'>;

  #scaledX: Scales['x'];

  #scaledY: Scales['y'];

  #yDomain: [number, number] = [0, 0];

  #wrapper?: D3Selection<SVGGElement>;

  #pathBodiesUp?: D3Selection<SVGPathElement>;

  #pathBodiesDown?: D3Selection<SVGPathElement>;

  #pathWicksUp?: D3Selection<SVGPathElement>;

  #pathWicksDown?: D3Selection<SVGPathElement>;

  #pathLastBodysUp?: D3Selection<SVGPathElement>;

  #pathLastBodyDown?: D3Selection<SVGPathElement>;

  #pathLastWickUp?: D3Selection<SVGPathElement>;

  #pathLastWickDown?: D3Selection<SVGPathElement>;

  constructor({ scales }: { scales: Scales }) {
    this.#scaledX = scales.x;
    this.#scaledY = scales.y;
  }

  public appendTo = (parent: Element): void => {
    const wrapper = d3.select(parent).append('g')
      .attr('class', 'plot')
      .attr('clip-path', 'url(#clipChart)');

    this.#wrapper = wrapper;

    this.#pathBodiesUp = wrapper.append('path').attr('class', 'body up');
    this.#pathBodiesDown = wrapper.append('path').attr('class', 'body down');
    this.#pathWicksUp = wrapper.append('path').attr('class', 'wick up');
    this.#pathWicksDown = wrapper.append('path').attr('class', 'wick down');

    this.#pathLastBodysUp = wrapper.append('path').attr('class', 'body up');
    this.#pathLastBodyDown = wrapper.append('path').attr('class', 'body down');
    this.#pathLastWickUp = wrapper.append('path').attr('class', 'wick up');
    this.#pathLastWickDown = wrapper.append('path').attr('class', 'wick down');
  };

  public draw = ({ candles: givenCandles, zoomTransform }: DrawData): void => {
    if (!givenCandles.length) return;
    const xDomain = this.#scaledX.domain() as [Date, Date];
    const yDomain = this.#scaledY.domain() as [number, number];

    const lastCandle = givenCandles[givenCandles.length - 1];
    const smoozCandles = Plot.smoozCandles(
      givenCandles.filter((x) => x.time >= xDomain[0].getTime()
        && x.time <= xDomain[1].getTime()),
    );
    const smoozLastCandle = smoozCandles.pop();

    // update last candle
    const upLastCandles = smoozLastCandle?.direction === 'UP' ? [smoozLastCandle] : [];
    const downLastCandles = smoozLastCandle?.direction === 'DOWN' ? [smoozLastCandle] : [];

    this.#pathLastBodysUp?.attr('d', this.#getBodies(upLastCandles, 'UP'));
    this.#pathLastWickUp?.attr('d', this.#getWicks(upLastCandles));
    this.#pathLastBodyDown?.attr('d', this.#getBodies(downLastCandles, 'DOWN'));
    this.#pathLastWickDown?.attr('d', this.#getWicks(downLastCandles));

    // update all rest if zoom or last candle was changed
    if (
      lastCandle?.time !== this.#lastCandle?.time
      || lastCandle?.interval !== this.#lastCandle?.interval
      || lastCandle?.symbol !== this.#lastCandle?.symbol
      || this.#zoomTransform !== zoomTransform
      // fixes https://trello.com/c/MOY6UwuT/208-chart-chart-not-resizing-when-price-goes-beyond-extreme
      || !isEqual(yDomain, this.#yDomain)
    ) {
      const upCandles = smoozCandles.filter((x) => x.direction === 'UP');
      const downCandles = smoozCandles.filter((x) => x.direction === 'DOWN');

      this.#pathBodiesUp?.attr('d', this.#getBodies(upCandles, 'UP'));
      this.#pathWicksUp?.attr('d', this.#getWicks(upCandles));
      this.#pathBodiesDown?.attr('d', this.#getBodies(downCandles, 'DOWN'));
      this.#pathWicksDown?.attr('d', this.#getWicks(downCandles));

      this.#yDomain = yDomain;
    }

    this.#lastCandle = lastCandle;
    this.#zoomTransform = zoomTransform;
  };

  // eslint-disable-next-line class-methods-use-this
  public resize(): void {
    // none
  }

  public update = (data: { scaledX?: d3.ScaleTime<number, number> }): void => {
    if (typeof data.scaledX !== 'undefined') {
      this.#scaledX = data.scaledX;
    }
  };

  #getBodies = (candles: api.FuturesChartCandle[], direction: api.FuturesChartCandle['direction']): string => {
    const width = this.bodyWidth;
    let string = '';

    for (const candle of candles) {
      string += this.#getBodyString(candle, direction, width);
    }
    return string;
  };

  #getBodyString = (candle: api.FuturesChartCandle, direction: api.FuturesChartCandle['direction'], width: number): string => {
    const open = Math.round(this.#scaledY(candle.open));
    const close = Math.round(this.#scaledY(candle.close));
    let top;
    let bottom;

    if (direction === 'UP') {
      bottom = open;
      top = close;
    } else {
      bottom = close;
      top = open;
    }

    const height = top - bottom;
    const x = Math.round(this.#scaledX(candle.time)) - width / 2;
    const y = top;

    return `M${x},${y} h${width}v${-height}h${-width}z`;
  };

  #getWicks = (candles: api.FuturesChartCandle[]): string => {
    let string = '';

    for (const candle of candles) {
      string += this.#getWickString(candle);
    }
    return string;
  };

  #getWickString = (candle: api.FuturesChartCandle): string => {
    const x = Math.round(this.#scaledX(candle.time));
    const y1 = Math.round(this.#scaledY(+candle.high));
    const y2 = Math.round(this.#scaledY(+candle.low));

    return `M${x},${y1} v${y2 - y1}`;
  };

  private get bodyWidth() {
    const scale = this.zoomScale;

    // Clamp width on high zoom out levels

    const width = (scale < 0.3) ? 1 // eslint-disable-line no-nested-ternary
      : (scale < 0.8) ? 1.5 // eslint-disable-line no-nested-ternary
        : (scale < 1.5) ? 2 // eslint-disable-line no-nested-ternary
          : (scale < 3.0) ? 3 // eslint-disable-line no-nested-ternary
            : scale;

    return width;
  }

  private get zoomScale() {
    return this.#wrapper ? d3.zoomTransform(this.#wrapper.node() as Element).k : 1;
  }

  /**
   * Returns an array of smoothed candles.
   * (Based on heikin ashi candles, but keeps the real high & low)
   */
  public static smoozCandles = (
    candles: api.FuturesChartCandle[],
    prevSmooz: api.FuturesChartCandle[] = [], // If updating
    startIndex = 0, // If updating
  ): api.FuturesChartCandle[] => {
    const newCandles: api.FuturesChartCandle[] = [
      ...prevSmooz.slice(0, startIndex),
    ];

    for (let i = startIndex; i < candles.length; i += 1) {
      const {
        open, close, high, low,
      } = candles[i];
      const previous = newCandles[i - 1] as api.FuturesChartCandle | undefined;

      let newOpen = previous
        ? (+previous.open + +previous.close) / 2
        : (open + close) / 2;
      let newClose = (open + close + high + low) / 4;

      const newDirection = (newOpen <= newClose)
        ? 'UP' : 'DOWN';

      // Clamp new open to low/high
      newOpen = newDirection === 'UP'
        ? Math.max(newOpen, low)
        : Math.min(newOpen, high);

      // Keep last candle close as vanilla (to visually keep track of price)
      if (i === candles.length - 1) {
        newClose = +close;
      }

      newCandles.push({
        ...candles[i],
        direction: newDirection,
        open: newOpen,
        close: newClose,
      });

      // Adjust close/open of previous candle, we don't want gaps
      if (previous) {
        if (newDirection === previous.direction) {
          previous.close = (previous.direction === 'UP')
            ? Math.max(previous.close, newOpen)
            : Math.min(previous.close, newOpen);
        } else {
          previous.open = (previous.direction === 'DOWN')
            ? Math.max(previous.open, newOpen)
            : Math.min(previous.open, newOpen);
        }
      }
    }

    return newCandles;
  };
}
