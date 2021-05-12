import * as d3 from 'd3';
import { format } from 'd3';
import {
  ChartItem, D3Selection, ResizeData, Scales,
} from '../types';

export default class Measurer implements ChartItem {
  #scales: Scales;

  #wrapper?: D3Selection<SVGGElement>;

  #rect?: D3Selection<SVGRectElement>;

  #labelContainer?: D3Selection<SVGForeignObjectElement>;

  #labelWrapper?: D3Selection<d3.BaseType>;

  #label?: D3Selection<d3.BaseType>;

  #start?: { x: Date; y: number; };

  #end?: { x: Date; y: number; };

  #chartWidth = 0;

  #chartHeight = 0;

  constructor({ scales }: { scales: Scales }) {
    this.#scales = scales;
  }

  public appendTo = (parent: Element): void => {
    const container = d3.select(parent);

    this.#wrapper = container.append('g')
      .attr('class', 'measurer')
      .attr('clip-path', 'url(#clipChart)')
      .attr('display', 'none');

    this.#rect = this.#wrapper.append('rect');

    this.#labelContainer = this.#wrapper.append('foreignObject');
    this.#labelWrapper = this.#labelContainer?.append('xhtml:div').attr('class', 'measurer-label');
    this.#label = this.#labelWrapper?.append('xhtml:div');
  };

  draw(coords: { x: number; y: number }, resizeData: ResizeData): void {
    this.#wrapper?.attr('display', 'visible');

    // Store chart-space coords for start and end points
    this.#end = {
      x: this.#scales.scaledX.invert(coords.x),
      y: this.#scales.y.invert(coords.y),
    };

    this.#start = this.#start || this.#end;

    this.resize(resizeData);
  }

  public resize(resizeData: ResizeData): void {
    if (this.#wrapper?.attr('display') === 'none' || !this.#start || !this.#end) return;

    this.#chartWidth = resizeData.width;
    this.#chartHeight = resizeData.height;

    // Get pixel coords for start and end points
    const start = {
      x: this.#scales.scaledX(this.#start.x),
      y: this.#scales.y(this.#start.y),
    };
    const end = {
      x: this.#scales.scaledX(this.#end.x),
      y: this.#scales.y(this.#end.y),
    };

    const x = Math.min(start.x, end.x);
    const y = Math.min(start.y, end.y);

    const width = Math.abs(end.x - start.x);
    const height = Math.abs(end.y - start.y);

    this.#drawRect(x, y, width, height);
    this.#drawLabel(x, end.y, width);
  }

  #drawRect = (x: number, y: number, width: number, height: number): void => {
    this.#rect
      ?.attr('x', x)
      .attr('y', y)
      .attr('width', width)
      .attr('height', height);
  };

  #drawLabel = (x: number, y: number, rectWidth: number): void => {
    this.#label?.html(this.#getLabelText());

    const yDirection = this.#end && this.#start && (this.#end?.y >= this.#start?.y) ? 1 : 0;
    const { width, height } = (this.#label?.node() as Element)?.getBoundingClientRect()
      ?? { width: 0, height: 0 };
    const margin = 8;

    // x
    if (x + width > this.#chartWidth) {
      // eslint-disable-next-line no-param-reassign
      x = this.#chartWidth - width; // Keep within svg bounds
    }

    // y
    if (yDirection) {
      // eslint-disable-next-line no-param-reassign
      y = y - height - margin;
      // eslint-disable-next-line no-param-reassign
      if (y < 0) y = 0; // Keep within svg bounds
    } else {
      // eslint-disable-next-line no-param-reassign
      y += margin;
      if (y + height > this.#chartHeight) {
        // eslint-disable-next-line no-param-reassign
        y = this.#chartHeight - height; // Same
      }
    }

    // Go place it
    this.#labelContainer?.attr('x', x).attr('y', y);

    this.#labelWrapper?.style('width', `${rectWidth}px`);
  };

  #getLabelText = (): string => 'TO DO'
  /* if (!this.#start || !this.#end) return '';
    const x1 = this.#start.x;
    const y1 = this.#start.y;
    const x2 = this.#end.x;
    const y2 = this.#end.y;

    const time = this.#getTimeInterval(Math.abs(x2 - x1));

    let amount = y2 - y1;

    let percentage = (y2 - y1) / y1;

    const leverage = api.position.leverage || 1;
    let leveragedPercent = (y2 - y1) / y1 * leverage;

    let trueLeverage = api.position.baseValue / api.account.balance;
    let trueLeveragedPercent = (y2 - y1) / y1 * trueLeverage;

    const side = (y2 >= y1) ? 'buy' : 'sell';
    const orderQty = (y2 >= y1)
      ? trading.order.buyQty
      : trading.order.sellQty;
    const orderValue = orderQty.value() * y1;
    let orderLeverage = orderValue / api.account.balance;
    let orderLeveragedPercent = (y2 - y1) / y1 * orderLeverage;

    // Formatting
    amount = format(',.2f')(amount);
    percentage = format('+,.2%')(percentage);
    leveragedPercent = format('+,.1%')(leveragedPercent);

    trueLeveragedPercent = format('+,.1%')(trueLeveragedPercent);
    trueLeverage = this.#formatLeverage(trueLeverage);

    orderLeveragedPercent = format('+,.1%')(orderLeveragedPercent);
    orderLeverage = this.#formatLeverage(orderLeverage);

    return `<b>${time}</b><br>`
        + `<b>${amount}</b> USDT<br>`
        + `<b>${percentage}</b><br>`
        + `<b>${leveragedPercent}</b> at ${leverage}x<br>`
        + `<b>${trueLeveragedPercent}</b> at ${trueLeverage}x (position)<br>`
        + `<b>${orderLeveragedPercent}</b> at ${orderLeverage}x (${side} qty)`;
    */
  ;

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  // eslint-disable-next-line class-methods-use-this
  #getTimeInterval = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const totalHours = Math.floor(totalMinutes / 60);
    const days = Math.floor(totalHours / 24);

    const minutes = totalMinutes % 60;
    const hours = totalHours % 24;

    return (days ? `${days}d ` : '')
        + (hours ? `${hours}h ` : '')
        + (minutes ? `${minutes}m` : '');
  };

  #formatLeverage = (leverage: number): string => format(leverage < 10 ? '.1~f' : 'd')(leverage);
}

/* Copyright 2020-2021 Pascal Reinhard

This file is published under the terms of the GNU Affero General Public License
as published by the Free Software Foundation, either version 3 of the License,
or (at your option) any later version. See <https://www.gnu.org/licenses/>. * /

'use strict'
const api = require('../../../../apis/futures')
const trading = require('../../trading')

module.exports = class Measurer {

    constructor (chart) {
        this.chart = chart
        this.scales = chart.scales
        this.drawing = false
    }

    appendTo (container, className) {
        this.wrapper = container.append('g')
                .class(className)
                .attr('clip-path', 'url(#clipChart)')
                .attr('display', 'none')
        this.rect = this.wrapper.append('rect')

        this.labelContainer = this.wrapper.append('foreignObject')
        this.labelWrapper = this.labelContainer.append('xhtml:div')
                .class('measurer-label')
        this.label = this.labelWrapper.append('xhtml:div')
    }

    draw (coords) {
        this.wrapper.attr('display', 'visible')

        // Store chart-space coords for start and end points
        this.end = {
            x: this.scales.scaledX.invert(coords.x),
            y: this.scales.y.invert(coords.y)
        }
        this.start = this.start || this.end

        this.resize()
    }

    hide () {
        this.wrapper.attr('display', 'none')
    }

    get hidden () {
        return (this.wrapper.attr('display') == 'none') ? true : false
    }

    resize () {
        if (this.wrapper.attr('display') === 'none')
            return

        // Get pixel coords for start and end points
        let start = {
            x: this.scales.scaledX(this.start.x),
            y: this.scales.y(this.start.y)
        }
        let end = {
            x: this.scales.scaledX(this.end.x),
            y: this.scales.y(this.end.y)
        }

        let x = Math.min(start.x, end.x)
        let y = Math.min(start.y, end.y)

        let width = Math.abs(end.x - start.x)
        let height = Math.abs(end.y - start.y)

        this._drawRect(x, y, width, height)
        this._drawLabel(x, end.y, width, height)
    }

    _drawRect (x, y, width, height) {
        this.rect
            .attr('x', x)
            .attr('y', y)
            .attr('width', width)
            .attr('height', height)
    }

    _drawLabel (x, y, rectWidth) {
        this.label.html(this._getLabelText())

        let yDirection = (this.end.y >= this.start.y) ? 1 : 0
        let { width, height } = this.label.node().getBoundingClientRect()
        let margin = 8

        // x
        if (x + width > this.chart.width) // Keep within svg bounds
            x = this.chart.width - width

        // y
        if (yDirection) {
            y = y - height - margin
            if (y < 0) y = 0 // Keep within svg bounds
        }
        else {
            y = y + margin
            if (y + height > this.chart.height) // Same
                y = this.chart.height - height
        }

        // Go place it
        this.labelContainer
                .attr('x', x)
                .attr('y', y)

        this.labelWrapper
            .style('width', rectWidth + 'px')
    }

    _getLabelText () {
        let x1 = this.start.x
        let y1 = this.start.y
        let x2 = this.end.x
        let y2 = this.end.y

        let time = this._getTimeInterval(Math.abs(x2 - x1))

        let amount = y2 - y1

        let percentage = (y2 - y1) / y1

        let leverage = api.position.leverage || 1
        let leveragedPercent = (y2 - y1) / y1 * leverage

        let trueLeverage = api.position.baseValue / api.account.balance
        let trueLeveragedPercent = (y2 - y1) / y1 * trueLeverage

        let side = (y2 >= y1) ? 'buy' : 'sell'
        let orderQty = (y2 >= y1)
                ? trading.order.buyQty
                : trading.order.sellQty
        let orderValue = orderQty.value() * y1
        let orderLeverage = orderValue / api.account.balance
        let orderLeveragedPercent = (y2 - y1) / y1 * orderLeverage

        // Formatting
        amount = nFormat(',.2f', amount)
        percentage = nFormat('+,.2%', percentage)
        leveragedPercent = nFormat('+,.1%', leveragedPercent)

        trueLeveragedPercent = nFormat('+,.1%', trueLeveragedPercent)
        trueLeverage = this._formatLeverage(trueLeverage)

        orderLeveragedPercent = nFormat('+,.1%', orderLeveragedPercent)
        orderLeverage = this._formatLeverage(orderLeverage)

        return `<b>${time}</b><br>`
            + `<b>${amount}</b> USDT<br>`
            + `<b>${percentage}</b><br>`
            + `<b>${leveragedPercent}</b> at ${leverage}x<br>`
            + `<b>${trueLeveragedPercent}</b> at ${trueLeverage}x (position)<br>`
            + `<b>${orderLeveragedPercent}</b> at ${orderLeverage}x (${side} qty)`
    }

    _getTimeInterval (milliseconds) {
        let days, hours, minutes, total_hours, total_minutes, total_seconds

        total_seconds = parseInt(Math.floor(milliseconds / 1000))
        total_minutes = parseInt(Math.floor(total_seconds / 60))
        total_hours = parseInt(Math.floor(total_minutes / 60))
        days = parseInt(Math.floor(total_hours / 24))

        minutes = parseInt(total_minutes % 60)
        hours = parseInt(total_hours % 24)

        return (days ? days + 'd ' : '')
            + (hours ? hours + 'h ' : '')
            + (minutes ? minutes + 'm' : '')
    }

    _formatLeverage (leverage) {
        return (leverage < 10)
                ? nFormat('.1~f', leverage)
                : nFormat('d', leverage)
    }
}
*/
