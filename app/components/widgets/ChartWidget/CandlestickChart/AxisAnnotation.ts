import * as d3 from 'd3';
import { ChartItem, D3Selection, Scales } from './types';

type Orient = 'top' | 'bottom' | 'left' | 'right';

interface Data {
  axis: d3.Axis<d3.NumberValue>;
  orient: Orient;
  value: string;
  text: string;
  color: string;
}

interface Params extends Data {
  axis: d3.Axis<d3.NumberValue>;
  orient: Orient;
  scales: Scales;
}

export default class AxisAnnotation implements ChartItem {
  #wrapper?: D3Selection<SVGGElement>;

  #value = '0.00';

  #color = '#ff0000';

  #orient: Orient;

  #axis: d3.Axis<d3.NumberValue>;

  constructor(params: Params) {
    this.#axis = params.axis;
    this.#orient = params.orient;
    this.#value = params.value;
    this.#color = params.color ?? this.#color;
  }

  public appendTo = (parent: Element): void => {
    const wrapper = d3.select(parent).append('g');
    this.#wrapper = wrapper;
    wrapper.append('path');
    wrapper.append('text');
    this.draw();
  };

  public resize = (): void => {};

  public update = (data: Partial<Pick<Data, 'value' | 'text' | 'color'>>): void => {
    if (typeof data.value !== 'undefined') {
      this.#value = data.value;
    }

    if (typeof data.color !== 'undefined') {
      this.#color = data.color;
    }

    this.draw();
  };

  public draw = (): void => {
    const wrapper = this.#wrapper;
    const scale = this.#axis.scale();
    const orient = this.#orient;
    const value = this.#value;

    let translate: [number, number] = [0, 0];

    switch (orient) {
      case 'left':
      case 'right': {
        translate = [0, scale(+value) || 0];
        break;
      }
      case 'top':
      case 'bottom': {
        translate = [scale(+value) || 0, 0];
        break;
      }
      default:
    }

    wrapper?.attr('transform', `translate(${translate[0]},${translate[1]})`)
      .attr('fill', this.#color)
      .attr('classname', 'axis-annotation');
    wrapper?.select('path').attr('d', this.#getPath());
    wrapper?.select('text').text(this.#value);
    this.#setTextAttributes();
  };

  #getPath = (): string => {
    const orient = this.#orient;
    const axis = this.#axis;
    const height = 14;
    const width = 50;
    const point = 4;
    const neg = orient === 'left' || orient === 'top' ? -1 : 1;

    const value = 1;
    let pt = point;

    switch (orient) {
      case 'left':
      case 'right': {
        let h = 0;

        if (height / 2 < point) pt = height / 2;
        else h = height / 2 - point;

        return `M 0 ${value} l ${neg * Math.max(axis.tickSizeInner(), 1)} ${-pt
        } l 0 ${-h} l ${neg * width} 0 l 0 ${height
        } l ${neg * -width} 0 l 0 ${-h}`;
      }
      case 'top':
      case 'bottom': {
        let w = 0;

        if (width / 2 < point) pt = width / 2;
        else w = width / 2 - point;

        return `M ${value} 0 l ${-pt} ${neg * Math.max(axis.tickSizeInner(), 1)
        } l ${-w} 0 l 0 ${neg * height} l ${width} 0 l 0 ${neg * -height
        } l ${-w} 0`;
      }
      default:
    }

    return '';
  };

  #setTextAttributes = (): void => {
    if (!this.#wrapper) return;
    const text = this.#wrapper?.select('text');
    const axis = this.#axis;
    const orient = this.#orient;
    const neg = orient === 'left' || orient === 'top' ? -1 : 1;

    switch (orient) {
      case 'left':
      case 'right':
        text.attr('x', neg * (Math.max(axis.tickSizeInner(), 0) + axis.tickPadding()))
          .attr('y', 0)
          .attr('dy', '.32em')
          .style('text-anchor', neg < 0 ? 'end' : 'start');
        break;
      case 'top':
      case 'bottom':
        text.attr('x', 0)
          .attr('y', neg * (Math.max(axis.tickSizeInner(), 0) + axis.tickPadding()))
          .attr('dy', neg < 0 ? '0em' : '.72em')
          .style('text-anchor', 'middle');
        break;
      default:
    }
  };
}
