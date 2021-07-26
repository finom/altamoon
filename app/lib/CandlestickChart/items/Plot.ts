import * as d3 from 'd3';
import {
  ChartItem, D3Selection, DrawData, Scales, SmoozCandle,
} from '../types';
import * as api from '../../../api';

export default class Plot implements ChartItem {
  #scaledX: Scales['x'];

  #scaledY: Scales['y'];

  #wrapper?: D3Selection<SVGGElement>;

  #pathBodiesUp?: D3Selection<SVGPathElement>;

  #pathBodiesDown?: D3Selection<SVGPathElement>;

  #pathWicksUp?: D3Selection<SVGPathElement>;

  #pathWicksDown?: D3Selection<SVGPathElement>;

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
  };

  public draw = ({ candles }: DrawData): void => {
    if (!candles.length) return;

    const smoozCandles = Plot.smoozCandles(candles);
    const upCandles = smoozCandles.filter((x) => x.direction === 'up');
    const downCandles = smoozCandles.filter((x) => x.direction === 'down');

    this.#pathBodiesUp?.attr('d', this.#getBodies(upCandles, 'up'));
    this.#pathWicksUp?.attr('d', this.#getWicks(upCandles));

    this.#pathBodiesDown?.attr('d', this.#getBodies(downCandles, 'down'));
    this.#pathWicksDown?.attr('d', this.#getWicks(downCandles));
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

  #getBodies = (candles: SmoozCandle[], direction: 'up' | 'down'): string => {
    const width = this.bodyWidth;
    let string = '';

    for (const candle of candles) {
      string += this.#getBodyString(candle, direction, width);
    }
    return string;
  };

  #getBodyString = (candle: SmoozCandle, direction: 'up' | 'down', width: number): string => {
    const open = Math.round(this.#scaledY(candle.open));
    const close = Math.round(this.#scaledY(candle.close));
    let top; let
      bottom;

    if (direction === 'up') {
      bottom = open;
      top = close;
    } else {
      bottom = close;
      top = open;
    }

    const height = top - bottom;
    const x = Math.round(this.#scaledX(candle.time)) - width / 2;
    const y = top;

    return `M${x},${y} h${width}v${-height}h${-width}z `;
  };

  #getWicks = (candles: SmoozCandle[]): string => {
    let string = '';

    for (const candle of candles) {
      string += this.#getWickString(candle);
    }
    return string;
  };

  #getWickString = (candle: SmoozCandle): string => {
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
 * */
  private static smoozCandles = (
    candles: api.FuturesChartCandle[],
    prevSmooz: SmoozCandle[] = [], // If updating
    startIndex = 0, // If updating
  ): SmoozCandle[] => {
    const newCandles: (SmoozCandle | api.FuturesChartCandle)[] = [
      ...prevSmooz.slice(0, startIndex),
    ];

    for (let i = startIndex; i < candles.length; i += 1) {
      const {
        open, close, high, low,
      } = candles[i];
      const previous = newCandles[i - 1] as SmoozCandle | undefined;

      let newOpen = (previous)
        ? (+previous.open + +previous.close) / 2
        : (+open + +close) / 2;
      let newClose = (+open + +close + +high + +low) / 4;

      const newDirection = (newOpen <= newClose)
        ? 'up' : 'down';

      // Clamp new open to low/high
      newOpen = (newDirection === 'up')
        ? Math.max(newOpen, +low)
        : Math.min(newOpen, +high);

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
          previous.close = (previous.direction === 'up')
            ? Math.max(previous.close, newOpen)
            : Math.min(previous.close, newOpen);
        } else {
          previous.open = (previous.direction === 'down')
            ? Math.max(previous.open, newOpen)
            : Math.min(previous.open, newOpen);
        }
      }
    }

    return newCandles as SmoozCandle[];
  };
}
