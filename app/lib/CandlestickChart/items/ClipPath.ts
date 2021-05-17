import * as d3 from 'd3';
import { ChartItem, D3Selection, ResizeData } from '../types';

export default class ClipPath implements ChartItem {
  #rect?: D3Selection<SVGRectElement>;

  #plotMouseEventsArea?: D3Selection<SVGRectElement>;

  public appendTo = (parent: Element, resizeData: ResizeData): void => {
    this.#rect = d3.select(parent).append('clipPath').attr('id', 'clipChart').append('rect');
    this.#plotMouseEventsArea = d3.select(parent).append('rect')
      .attr('clip-path', 'url(#clipChart)')
      .attr('id', 'plotMouseEventsArea')
      .attr('fill', 'transparent');

    this.resize(resizeData);
  };

  public resize = ({ width, height }: ResizeData): void => {
    this.#rect?.attr('x', 0)
      .attr('y', 0)
      .attr('width', width)
      .attr('height', height);

    this.#plotMouseEventsArea?.attr('x', 0)
      .attr('y', 0)
      .attr('width', width)
      .attr('height', height);
  };
}

/* Copyright 2020-2021 Pascal Reinhard

This file is published under the terms of the GNU Affero General Public License
as published by the Free Software Foundation, either version 3 of the License,
or (at your option) any later version. See <https://www.gnu.org/licenses/>.

'use strict'

module.exports = class ClipPath {

    constructor (chart, x = 0, y = 0) {
        this.chart = chart
        this.x = x
        this.y = y
    }

    appendTo (container, id) {
        this.rect = container.append('clipPath')
                .attr('id', id)
            .append('rect')

        this.resize()
    }

    resize () {
        this._getDimensions()
        this.rect.attr('x', this.x)
                .attr('y', this.y)
                .attr('width', this.width)
                .attr('height', this.height)
    }

    _getDimensions () {
        this.width = this.chart.width
        this.height = this.chart.height
    }
}
*/
