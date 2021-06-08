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

/* Copyright 2020-2021 Pascal Reinhard

This file is published under the terms of the GNU Affero General Public License
as published by the Free Software Foundation, either version 3 of the License,
or (at your option) any later version. See <https://www.gnu.org/licenses/>

'use strict'
const smoozCandles = require('./smooz-candles')

'use strict'

module.exports = smoozCandles

class Plot {

    constructor (scales) {
        this.xScale = scales.x
        this.yScale = scales.y

        this.candles = []
        this.smoozCandles = []

        this.wrapper

        this.pathBodiesUp
        this.pathBodiesDown
        this.pathWicksUp
        this.pathWicksDown
    }

    // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
    //   WRAPPER
    // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
    appendTo (container) {
        this.wrapper = container.append('g')
            .class('plot')
            .attr('clip-path', 'url(#clipChart)')

        this.pathBodiesUp = this.wrapper.append('path')
                .class('body up')
        this.pathBodiesDown = this.wrapper.append('path')
                .class('body down')
        this.pathWicksUp = this.wrapper.append('path')
                .class('wick up')
        this.pathWicksDown = this.wrapper.append('path')
                .class('wick down')

        this.lastBody = this.wrapper.append('path')
        this.lastWick = this.wrapper.append('path')

        return this.wrapper
    }

    // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
    //   DRAW
    // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
    draw (candles, update = false) {
        if (!candles.length)
            return

        if (update || !this.candles.length
                   || candles.last.timestamp != this.candles.last.timestamp) {
            this.candles = [...candles]
            this.smoozCandles = smoozCandles(candles)
        }

        candles = [...this.smoozCandles]
        let lastCandle = candles.pop()

        let upCandles = candles.filter(x => x.direction === 'up')
        let downCandles = candles.filter(x => x.direction === 'down')

        this.pathBodiesUp
            .attr('d', this._getBodies(upCandles, 'up'))
        this.pathWicksUp
            .attr('d', this._getWicks(upCandles, 'up'))
        this.pathBodiesDown
            .attr('d', this._getBodies(downCandles, 'down'))
        this.pathWicksDown
            .attr('d', this._getWicks(downCandles, 'down'))

        this.lastBody
            .attr('d', this._getBodyString(
                lastCandle,
                lastCandle.direction,
                this._bodyWidth
            ))
            .class('body ' + lastCandle.direction)
        this.lastWick
            .attr('d', this._getWickString(lastCandle))
            .class('wick ' + lastCandle.direction)
    }

    // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
    //   UPDATE LAST CANDLE
    // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
    updateLast (candle) {
        let index = this.candles.lastIndex
        this.candles.last = candle

        this.smoozCandles = smoozCandles(
            this.candles,
            this.smoozCandles,
            index
        )

        candle = this.smoozCandles.last

        this.lastBody
            .attr('d', this._getBodyString(
                candle,
                candle.direction,
                this._bodyWidth
            ))
            .class('body ' + candle.direction)
        this.lastWick
            .attr('d', this._getWickString(candle))
            .class('wick ' + candle.direction)
    }

    // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
    //   INTERNAL METHODS
    // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
    _getBodies (candles, direction) {
        let width = this._bodyWidth
        let string = ''

        for (let candle of candles) {
            string += this._getBodyString(candle, direction, width)
        }
        return string
    }

    _getBodyString(candle, direction, width) {
        let open = Math.round(this.yScale(candle.open))
        let close = Math.round(this.yScale(candle.close))
        let top, bottom

        if (direction === 'up')
            bottom = open,
            top = close
        else
            bottom = close,
            top = open

        let height = top - bottom
        let x = Math.round(this.xScale(candle.date)) - width / 2
        let y = top

        return 'M' + x + ',' + y
            + ' h' + width + 'v' + -height + 'h' + -width + 'z '
    }

    _getWicks (candles) {
        let string = ''

        for (let candle of candles) {
            string += this._getWickString(candle)
        }
        return string
    }

    _getWickString(candle) {
        let x = Math.round(this.xScale(candle.date))
        let y1 = Math.round(this.yScale(candle.high))
        let y2 = Math.round(this.yScale(candle.low))

        return 'M' + x + ',' + y1 + ' v' + (y2 - y1)
    }

    get _bodyWidth () {
        let scale = this._zoomScale

        // Clamp width on high zoom out levels
        let width = (scale < 0.3) ? 1 :
                    (scale < 0.8) ? 1.5 :
                    (scale < 1.5) ? 2 :
                    (scale < 3.0) ? 3 :
                    scale

        return width
    }

    get _zoomScale () {
        return d3.zoomTransform(this.wrapper.node()).k
    }
}

module.exports = Plot
*/
