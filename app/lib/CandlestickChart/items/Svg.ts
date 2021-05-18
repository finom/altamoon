import * as d3 from 'd3';
import { ChartItem, D3Selection, ResizeData } from '../types';

export default class Svg implements ChartItem {
  #svg?: D3Selection<SVGSVGElement>;

  #groupSelection?: D3Selection<SVGGElement>;

  public appendTo = (parent: Element, resizeData: ResizeData): SVGGElement => {
    this.#svg = d3.select(parent).append('svg').attr('class', 'chart-svg');

    this.#groupSelection = this.#svg.append('g').attr('id', 'mainGroup');

    this.resize(resizeData);

    return this.#groupSelection.node() as SVGGElement;
  };

  public resize = ({ width, height, margin }: ResizeData): void => {
    this.#svg
      ?.attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    this.#groupSelection
      ?.attr('transform', `translate(${margin.left},${margin.top})`);
  };
}
/* Copyright 2020-2021 Pascal Reinhard

This file is published under the terms of the GNU Affero General Public License
as published by the Free Software Foundation, either version 3 of the License,
or (at your option) any later version. See <https://www.gnu.org/licenses/>.

'use strict'

module.exports = class Svg {

    constructor (chart) {
        this.chart = chart
    }

    appendTo (selector = '#chart') {
        this.svg = d3.select(selector).append('svg')
        this.graph = this.svg.append('g')
        this.resize()
    }

    resize () {
        let width = this.chart.width
        let height = this.chart.height
        let margin = this.chart.margin

        this.svg
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
        this.graph
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
    }

    append = (...args) => this.graph.append(...args)

    insert = (...args) => this.graph.insert(...args)

    call = (...args) => this.graph.call(...args)

    on = (...args) => this.graph.on(...args)
}
 */
