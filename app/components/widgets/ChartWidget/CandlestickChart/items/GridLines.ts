import * as d3 from 'd3';
import {
  ChartItem, D3Selection, ResizeData, Scales,
} from '../types';

export default class GridLines implements ChartItem {
  #x: d3.Axis<Date | d3.NumberValue>;

  #width = 0;

  #y: (g: D3Selection<SVGGElement>) => D3Selection<SVGGElement>;

  #xWrapper?: D3Selection<SVGGElement>;

  #yWrapper?: D3Selection<SVGGElement>;

  constructor({ scales }: { scales: Scales }) {
    this.#x = d3.axisTop(scales.x).tickFormat(() => '');

    this.#y = (g: D3Selection<SVGGElement>) => g.call(d3.axisLeft(scales.y)
      .tickFormat(() => '')
      .tickSize(-this.#width)
      .tickValues(d3.scaleLinear().domain(scales.y.domain()).ticks()));
  }

  public appendTo = (parent: Element, resizeData: ResizeData): void => {
    const container = d3.select(parent);
    this.#xWrapper = container.append('g').attr('class', 'x gridlines');
    this.#yWrapper = container.append('g').attr('class', 'y gridlines');
    this.resize(resizeData);
  };

  public resize = ({ width, height }: ResizeData): void => {
    this.#x.tickSize(-height);
    this.#width = width;
  };

  public draw(): void {
    this.#xWrapper?.call(this.#x);
    this.#yWrapper?.call(this.#y);
  }

  public update = (data: { scaledX?: d3.ScaleTime<number, number> }): void => {
    if (typeof data.scaledX !== 'undefined') {
      this.#x.scale(data.scaledX);
    }
  };
}
