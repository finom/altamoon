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
