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

  public update = (data: {
    pricePrecision?: number,
    scaledX?: d3.ScaleTime<number, number>,
  }): void => {
    if (typeof data.pricePrecision !== 'undefined') {
      const tickFormat = d3.format(`.${data.pricePrecision}f`);
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
