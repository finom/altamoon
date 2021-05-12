import * as d3 from 'd3';
import {
  ChartItem, D3Selection, ResizeData, Scales,
} from '../types';

export default class Axes implements ChartItem {
  #x: d3.Axis<d3.NumberValue>;

  #yLeft: d3.Axis<d3.NumberValue>;

  #yRight: d3.Axis<d3.NumberValue>;

  #gX?: D3Selection<SVGGElement>;

  #gYLeft?: D3Selection<SVGGElement>;

  #gYRight?: D3Selection<SVGGElement>;

  constructor({ scales }: { scales: Scales; }) {
    this.#x = d3.axisBottom(scales.x);

    this.#yLeft = d3.axisLeft(scales.y);

    this.#yRight = d3.axisRight(scales.y);
  }

  public getAxis = (): {
    x: d3.Axis<d3.NumberValue>;
    yLeft: d3.Axis<d3.NumberValue>;
    yRight: d3.Axis<d3.NumberValue>;
  } => ({
    x: this.#x,
    yLeft: this.#yLeft,
    yRight: this.#yRight,
  });

  public appendTo = (parent: Element, resizeData: ResizeData): void => {
    const container = d3.select(parent);

    this.#gX = container.append('g').attr('class', 'x axis bottom');

    this.#gYLeft = container.append('g').attr('class', 'y axis left');
    this.#gYRight = container.append('g').attr('class', 'y axis right');
    this.#resizeContainers(resizeData);
  };

  public draw({ scales }: ResizeData): void {
    this.#gX?.call(this.#x);
    this.#gYLeft?.call(
      this.#yLeft.tickValues(d3.scaleLinear().domain(scales.y.domain()).ticks()),
    );
    this.#gYRight?.call(
      this.#yRight.tickValues(d3.scaleLinear().domain(scales.y.domain()).ticks()),
    );
  }

  public resize = (resizeData: ResizeData): void => {
    const { scales } = resizeData;
    this.#x.scale(scales.x);
    this.#yLeft.scale(scales.y);
    this.#yRight.scale(scales.y);
    this.#resizeContainers(resizeData);
  };

  public update = (data: { yPrecision?: number, scaledX?: d3.ScaleTime<number, number> }): void => {
    if (typeof data.yPrecision !== 'undefined') {
      const tickFormat = d3.format(`.${data.yPrecision}f`);
      this.#yLeft.tickFormat(tickFormat);
      this.#yRight.tickFormat(tickFormat);
    }
    if (typeof data.scaledX !== 'undefined') {
      this.#x.scale(data.scaledX);
    }
  };

  #resizeContainers = ({ width, height }: ResizeData): void => {
    this.#gX?.attr('transform', `translate(0,${height})`);
    this.#gYRight?.attr('transform', `translate(${width},0)`);
  };
}

/* Copyright 2020-2021 Pascal Reinhard

This file is published under the terms of the GNU Affero General Public License
as published by the Free Software Foundation, either version 3 of the License,
or (at your option) any later version. See <https://www.gnu.org/licenses/>.

'use strict'

module.exports = class Axes {

    constructor (chart) {
        this.chart = chart
        this._getDimensions()

        this.x = d3.axisBottom(this.scales.x)

        let tickFormat = d3.format('.' + chart.yPrecision + 'f')

        this.yLeft = d3.axisLeft(this.scales.y)
                .tickFormat(tickFormat)

        this.yRight = d3.axisRight(this.scales.y)
                .tickFormat(tickFormat)
    }

    appendTo (container) {
        this.gX = container.append('g').class('x axis bottom')

        this.gYLeft = container.append('g').class('y axis left')
        this.gYRight = container.append('g').class('y axis right')

        this._resizeContainers()
    }

    draw () {
        this.gX.call(this.x)
        this.gYLeft.call(this.yLeft
            .tickValues(d3.scaleLinear().domain(this.scales.y.domain()).ticks())
        )
        this.gYRight.call(this.yRight
            .tickValues(d3.scaleLinear().domain(this.scales.y.domain()).ticks())
        )
    }

    resize () {
        this._getDimensions()
        this.x.scale(this.scales.x)
        this.yLeft.scale(this.scales.y)
        this.yRight.scale(this.scales.y)
        this._resizeContainers()
    }

    _resizeContainers () {
        this.gX.attr('transform', 'translate(0,' + this.height + ')')
        this.gYRight.attr('transform', 'translate(' + this.width + ',0)')
    }

    _getDimensions () {
        this.scales = this.chart.scales
        this.width = this.chart.width
        this.height = this.chart.height
    }
}

*/
