import * as d3 from 'd3';
import * as api from 'altamoon-binance-api';
import { isEqual } from 'lodash';

import {
  ChartPaddingPercents,
  D3Selection, DrawData, Scales,
} from '../types';

import Plot from './Plot';

export default class Volume {
  #lastCandle?: api.FuturesChartCandle;

  #paddingPercents: ChartPaddingPercents;

  #scaledX: Scales['x'];

  #scaledY: Scales['y'];

  #yDomain: [number, number] = [0, 0];

  #wrapper?: D3Selection<SVGGElement>;

  #pathUp?: D3Selection<SVGPathElement>;

  #pathDown?: D3Selection<SVGPathElement>;

  #pathLastUp?: D3Selection<SVGPathElement>;

  #pathLastDown?: D3Selection<SVGPathElement>;

  #zoomTransform?: Pick<d3.ZoomTransform, 'k' | 'x' | 'y'>;

  constructor({
    scales, paddingPercents,
  }: { scales: Scales; paddingPercents: ChartPaddingPercents }) {
    this.#scaledX = scales.x;
    this.#scaledY = scales.y;
    this.#paddingPercents = paddingPercents;
  }

  public appendTo = (parent: Element): void => {
    const wrapper = d3.select(parent).append('g')
      .attr('class', 'volume')
      .attr('clip-path', 'url(#clipChart)');

    this.#wrapper = wrapper;

    this.#pathUp = wrapper.append('path').attr('class', 'body up');
    this.#pathDown = wrapper.append('path').attr('class', 'body down');

    this.#pathLastUp = wrapper.append('path').attr('class', 'body up');
    this.#pathLastDown = wrapper.append('path').attr('class', 'body down');
  };

  public draw = ({
    candles: givenCandles, zoomTransform,
  }: DrawData): void => {
    if (!givenCandles.length) return;

    const yDomain = this.#scaledY.domain() as [number, number];
    const xDomain = this.#scaledX.domain() as [Date, Date];

    const candles = Plot.smoozCandles(
      givenCandles.filter((x) => x.time >= xDomain[0].getTime()
        && x.time <= xDomain[1].getTime()),
    );
    const maxVolume = candles.reduce((vol, { volume }) => Math.max(vol, volume), 0);
    const firstCandles = candles.slice(0, -1);
    const lastCandle = candles[candles.length - 1];

    // update last candle
    const upLastCandles = lastCandle?.direction === 'UP' ? [lastCandle] : [];
    const downLastCandles = lastCandle?.direction === 'DOWN' ? [lastCandle] : [];

    this.#pathLastUp?.attr('d', this.#getBodies(upLastCandles, maxVolume));
    this.#pathLastDown?.attr('d', this.#getBodies(downLastCandles, maxVolume));

    // update rest if zoom or last candle was changed
    if (
      lastCandle?.time !== this.#lastCandle?.time
      || lastCandle?.interval !== this.#lastCandle?.interval
      || lastCandle?.symbol !== this.#lastCandle?.symbol
      || this.#zoomTransform !== zoomTransform
      || !isEqual(yDomain, this.#yDomain)
    ) {
      const upCandles = firstCandles.filter((x) => x.direction === 'UP');
      const downCandles = firstCandles.filter((x) => x.direction === 'DOWN');

      this.#pathUp?.attr('d', this.#getBodies(upCandles, maxVolume));
      this.#pathDown?.attr('d', this.#getBodies(downCandles, maxVolume));

      this.#yDomain = yDomain;
    }

    this.#lastCandle = lastCandle;
    this.#zoomTransform = zoomTransform;
  };

  public update = (
    data: {
      shouldShowVolume?: boolean;
      scaledX?: d3.ScaleTime<number, number>;
      paddingPercents?: ChartPaddingPercents;
    },
  ) => {
    if (typeof data.shouldShowVolume !== 'undefined') {
      this.#wrapper?.style('display', data.shouldShowVolume ? '' : 'none');
    }

    if (typeof data.scaledX !== 'undefined') {
      this.#scaledX = data.scaledX;
    }

    if (typeof data.paddingPercents !== 'undefined') {
      this.#paddingPercents = data.paddingPercents;
    }
  };

  #getBodies = (candles: api.FuturesChartCandle[], maxVolume: number): string => {
    const width = this.bodyWidth;
    let string = '';

    for (const candle of candles) {
      string += this.#getBodyString(candle, width, maxVolume);
    }

    return string;
  };

  #getBodyString = (
    candle: api.FuturesChartCandle,
    width: number,
    maxVolume: number,
  ): string => {
    const yDomain = this.#scaledY.domain() as [number, number];
    const chartHeight = Math.round(this.#scaledY(yDomain[0]));
    const height = (candle.volume / maxVolume)
      * chartHeight
      * (this.#paddingPercents.bottom / 100)
      * 0.9
      - 30; // minus X axis height

    const x = Math.round(this.#scaledX(candle.time)) - width / 2;

    return `M${x},${chartHeight} h${width}v${-height}h${-width}z`;
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
}
