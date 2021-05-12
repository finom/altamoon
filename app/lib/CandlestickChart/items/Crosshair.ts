import * as d3 from 'd3';
import techan, { PlotMixin } from 'techan';
import { TodoAny } from '../../../types';
import {
  ChartItem, D3Selection, ResizeData, Scales,
} from '../types';

interface Params {
  scales: Scales;
  resizeData: ResizeData;
  axis: {
    x: d3.Axis<d3.NumberValue>;
    yLeft: d3.Axis<d3.NumberValue>;
    yRight: d3.Axis<d3.NumberValue>;
  }
}

export default class Crosshair implements ChartItem {
  #yPrecision = 1;

  #techan: PlotMixin;

  #wrapper?: D3Selection<SVGGElement>;

  #axis: Params['axis'];

  #resizeData: ResizeData;

  constructor({ scales, resizeData, axis }: Params) {
    this.#techan = techan.plot.crosshair()
      .xScale(scales.x)
      .yScale(scales.y)
      .xAnnotation(this.#bottomAxisLabel(axis.x, resizeData.height))
      .yAnnotation([
        this.#leftAxisLabel(axis.yLeft),
        this.#rightAxisLabel(axis.yRight, resizeData.width),
      ]);

    this.#axis = axis;
    this.#resizeData = resizeData;
  }

  public appendTo = (parent: Element): void => {
    this.#wrapper = d3.select(parent).append('g').attr('class', 'crosshair');
  };

  public resize = (resizeData: ResizeData): void => {
    this.#resizeData = resizeData;
    this.#techan
      .xAnnotation(this.#bottomAxisLabel(this.#axis.x, resizeData.height))
      .yAnnotation([
        this.#leftAxisLabel(this.#axis.yLeft),
        this.#rightAxisLabel(this.#axis.yRight, resizeData.width),
      ]);
  };

  public draw = (): void => {
    this.#wrapper?.call(this.#techan as TodoAny);
  };

  public update = (data: { yPrecision?: number }): void => {
    if (typeof data.yPrecision !== 'undefined') {
      this.#yPrecision = data.yPrecision;

      this.#techan
        .xAnnotation(this.#bottomAxisLabel(this.#axis.x, this.#resizeData.height))
        .yAnnotation([
          this.#leftAxisLabel(this.#axis.yLeft),
          this.#rightAxisLabel(this.#axis.yRight, this.#resizeData.width),
        ]);
    }
  };

  #bottomAxisLabel = (
    xAxis: d3.Axis<d3.NumberValue>, height: number,
  ): TodoAny => techan.plot.axisannotation()
    .axis(xAxis)
    .orient('bottom')
    .format(d3.timeFormat('%-d/%-m/%Y %-H:%M:%S'))
    .width(94)
    .translate([0, height]);

  #leftAxisLabel = (yAxisLeft: d3.Axis<d3.NumberValue>): TodoAny => techan.plot.axisannotation()
    .axis(yAxisLeft)
    .orient('left')
    .format(d3.format(`,.${this.#yPrecision}f`));

  #rightAxisLabel = (
    yAxisRight: d3.Axis<d3.NumberValue>, width: number,
  ): TodoAny => techan.plot.axisannotation()
    .axis(yAxisRight)
    .orient('right')
    .format(d3.format(`,.${this.#yPrecision}f`))
    .translate([width, 0]);
}

/*
const techan = require('techan')
const AxisLabel = require('./axis-label')

module.exports = class Crosshair {

    wrapper

    constructor (chart) {
        this.chart = chart
        this.axisLabel = new AxisLabel(chart)
        this._getDimensions()

        this.techan = techan.plot.crosshair()
                .xScale(this.scales.x)
                .yScale(this.scales.y)
                .xAnnotation(this.axisLabel.bottom(this.axes.x, this.height))
                .yAnnotation([
                    this.axisLabel.left(this.axes.yLeft),
                    this.axisLabel.right(this.axes.yRight, this.width)
                ])
    }

    appendTo (container) {
        this.wrapper = container.append('g')
            .class('crosshair')
    }

    draw () {
        this.wrapper.call(this.techan)
    }

    resize () {
        this._getDimensions()
        this.techan
            .xAnnotation(this.axisLabel.bottom(this.axes.x, this.height))
            .yAnnotation([
                this.axisLabel.left(this.axes.yLeft),
                this.axisLabel.right(this.axes.yRight, this.width)
            ])
    }

    _getDimensions () {
        this.scales = this.chart.scales
        this.axes = this.chart.axes
        this.width = this.chart.width
        this.height = this.chart.height
    }
}

/* Copyright 2020-2021 Pascal Reinhard

This file is published under the terms of the GNU Affero General Public License
as published by the Free Software Foundation, either version 3 of the License,
or (at your option) any later version. See <https://www.gnu.org/licenses/>. * /

'use strict'
const techan = require('techan')

module.exports = class AxisLabel {

    constructor (chart) {
        this.chart = chart
    }

    bottom (xAxis, height) {
        return techan.plot.axisannotation()
            .axis(xAxis)
            .orient('bottom')
            .format(d3.timeFormat('%-d/%-m/%Y %-H:%M:%S'))
            .width(94)
            .translate([0, height])
    }

    left (yAxisLeft) {
        return techan.plot.axisannotation()
            .axis(yAxisLeft)
            .orient('left')
            .format(d3.format(',.' + this.chart.yPrecision + 'f'))
    }

    right (yAxisRight, width) {
        return techan.plot.axisannotation()
            .axis(yAxisRight)
            .orient('right')
            .format(d3.format(',.' + this.chart.yPrecision + 'f'))
            .translate([width, 0])
    }
}

*/
