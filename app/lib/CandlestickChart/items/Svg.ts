import * as d3 from 'd3';
import { ChartItem, D3Selection, ResizeData } from '../types';

export default class Svg implements ChartItem {
  #svg?: D3Selection<SVGSVGElement>;

  #groupSelection?: D3Selection<SVGGElement>;

  public appendTo = (parent: Element, resizeData: ResizeData): SVGGElement => {
    this.#svg = d3.select(parent).append('svg').attr('class', 'chart-svg');

    this.#groupSelection = this.#svg.append<SVGGElement>('g').attr('id', 'mainGroup');

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
