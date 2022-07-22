import * as d3 from 'd3';
import * as api from 'altamoon-binance-api';
import { isEqual } from 'lodash';

import {
  ChartPaddingPercents, D3Selection, DrawData, Scales,
} from '../types';

import Plot from './Plot';
import formatMoneyNumber from '../../../../../lib/formatMoneyNumber';

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

  #tooltipWrapper?: D3Selection<SVGForeignObjectElement>;

  #tooltip?: D3Selection<HTMLDivElement>;

  #maxVolume = 0;

  #filteredCandles: api.FuturesChartCandle[] = [];

  constructor({
    scales, paddingPercents,
  }: { scales: Scales; paddingPercents: ChartPaddingPercents }) {
    this.#scaledX = scales.x;
    this.#scaledY = scales.y;
    this.#paddingPercents = paddingPercents;
  }

  public appendTo = (parent: Element): void => {
    const wrapper = d3.select(parent).append('g')
      .attr('class', 'volume');
      // .attr('clip-path', 'url(#clipChart)');

    this.#wrapper = wrapper;

    this.#pathUp = wrapper.append('path').attr('class', 'body up');
    this.#pathDown = wrapper.append('path').attr('class', 'body down');

    this.#pathLastUp = wrapper.append('path').attr('class', 'body up');
    this.#pathLastDown = wrapper.append('path').attr('class', 'body down');

    const tooltipWrapper = d3.select(parent).append('foreignObject')
      .attr('class', 'tooltip-wrapper');
    const tooltip = tooltipWrapper.append<HTMLDivElement>('xhtml:div').classed('volume-tooltip', true);

    this.#tooltipWrapper = tooltipWrapper;
    this.#tooltip = tooltip;

    tooltip.style('display', 'none');
    wrapper.on('mousemove', (evt: MouseEvent) => {
      const { offsetX } = evt;

      const date = this.#scaledX.invert(offsetX + this.bodyWidth);
      const time = date.getTime();

      const candle = this.#filteredCandles.find((c, i, candles) => {
        if (i === 0 && time < c.time) return true;
        if (i === candles.length && time > c.closeTime) return true;
        if (c.time < time && c.closeTime > time) return true;
        return false;
      });

      if (!candle) return; // TS ensure

      this.#tooltip
        ?.style('display', '')
        .classed('up', candle.direction === 'UP')
        .classed('down', candle.direction === 'DOWN')
        .html(`
          <div class="text-center">
            <nobr>${formatMoneyNumber(candle.quoteVolume)} $</nobr>
            <nobr>${formatMoneyNumber(candle.volume)} ${candle.symbol.replace(/USDT|BUSD/, '')}</nobr>
          </div>
        `);

      const width = this.#tooltip?.node()?.getBoundingClientRect().width ?? 0;
      const height = this.#tooltip?.node()?.getBoundingClientRect().height ?? 0;
      const tooltipCenter = Math.round(this.#scaledX(candle.time));
      const x = tooltipCenter - width / 2;
      const y = this.#getChartHeight() - this.#getCandleHeight(candle) - height;

      this.#tooltipWrapper
        ?.attr('x', x)
        .attr('y', y);
    })
      .on('mouseleave', () => {
        this.#tooltip?.style('display', 'none');
      });
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

    this.#filteredCandles = candles;

    const firstCandles = candles.slice(0, -1);
    const lastCandle = candles[candles.length - 1];

    this.#maxVolume = candles.reduce((vol, { volume }) => Math.max(vol, volume), 0);

    // update last candle
    const upLastCandles = lastCandle?.direction === 'UP' ? [lastCandle] : [];
    const downLastCandles = lastCandle?.direction === 'DOWN' ? [lastCandle] : [];

    this.#pathLastUp?.attr('d', this.#getBodies(upLastCandles));
    this.#pathLastDown?.attr('d', this.#getBodies(downLastCandles));

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

      this.#pathUp?.attr('d', this.#getBodies(upCandles));
      this.#pathDown?.attr('d', this.#getBodies(downCandles));

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

  #getBodies = (candles: api.FuturesChartCandle[]): string => {
    const width = this.bodyWidth;
    let string = '';

    for (const candle of candles) {
      string += this.#getBodyString(candle, width);
    }

    return string;
  };

  #getBodyString = (
    candle: api.FuturesChartCandle,
    width: number,
  ): string => {
    const chartHeight = this.#getChartHeight();
    const height = this.#getCandleHeight(candle);

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

  #getCandleHeight = (candle: api.FuturesChartCandle) => {
    const chartHeight = this.#getChartHeight();
    return (candle.volume / this.#maxVolume)
      * chartHeight
      * (this.#paddingPercents.bottom / 100)
      * 0.6;
  };

  #getChartHeight = () => {
    const yDomain = this.#scaledY.domain() as [number, number];
    return Math.round(this.#scaledY(yDomain[0]));
  };

  private get zoomScale() {
    return this.#wrapper ? d3.zoomTransform(this.#wrapper.node() as Element).k : 1;
  }
}
