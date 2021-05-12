import * as d3 from 'd3';
import convertType from '../../convertType';
import { ChartItem, D3Selection, ResizeData } from '../types';

type Orient = 'top' | 'bottom' | 'left' | 'right';

export interface PriceLinesDatum {
  xValue?: number;
  yValue?: number;
  label?: string;
  color?: string;
  xLineStyle?: 'solid' | 'dashed';
  yLineStyle?: 'solid' | 'dashed';
}

interface ChartAxis {
  x: d3.Axis<d3.NumberValue>;
  yLeft: d3.Axis<d3.NumberValue>;
  yRight: d3.Axis<d3.NumberValue>;
}

export default class PriceLines implements ChartItem {
  #wrapper?: D3Selection<SVGGElement>;

  #items: PriceLinesDatum[];

  #showX = false;

  #color = '#f00';

  #axis: ChartAxis;

  #resizeData: ResizeData;

  constructor(
    { items, axis }: { items: PriceLinesDatum[], axis: ChartAxis },
    resizeData: ResizeData,
  ) {
    this.#items = items;
    this.#axis = axis;
    this.#resizeData = resizeData;
  }

  public appendTo = (parent: Element, resizeData: ResizeData): void => {
    this.#wrapper = d3.select(parent).append('g');

    this.update({ items: this.#items });

    this.resize(resizeData);
  };

  public resize = (resizeData: ResizeData): void => {
    this.#resizeData = resizeData;

    this.#wrapper?.select('.price-line-right-group')
      .attr('transform', `translate(${resizeData.width}, 0)`);

    // --- line ---
    this.#wrapper?.select('line')
      .attr('x2', resizeData.width);
  };

  public update = (data: { items?: PriceLinesDatum[] }): void => {
    if (!this.#wrapper) return;

    if (typeof data.items !== 'undefined') {
      this.#items = data.items;

      const updateHandler = (
        update: d3.Selection<d3.BaseType, PriceLinesDatum, SVGGElement, unknown>,
        orient: Orient,
        axis: d3.Axis<d3.NumberValue>,
      ): d3.Selection<d3.BaseType, PriceLinesDatum, SVGGElement, unknown> => {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        const textSelection = update.select(`.price-line-${orient}-label`) as d3.Selection<SVGTextElement, PriceLinesDatum, SVGGElement, unknown>;
        update
          .attr('transform', (d) => `translate(0,${String(axis.scale()(d.yValue ?? 0))})`)
          .attr('fill', ({ color }) => color ?? this.#color);

        this.#setPriceTextAttributes({
          textSelection,
          axis,
          orient,
        });

        return update;
      };

      this.#wrapper
        .selectAll('.price-line-item')
        .data(data.items)
        .join(
          (enter) => {
            const wrapper = enter.append('g').attr('class', 'price-line-item');

            // --- line ---
            wrapper.append('line')
              .attr('x1', 0)
              .attr('y1', 0)
              .attr('x2', this.#resizeData.width)
              .attr('y2', 0)
              .attr('stroke', ({ color }) => color ?? this.#color);

            // --- left label ---
            const leftLabelGroup = wrapper.append('g').attr('class', 'price-line-left-group');
            leftLabelGroup.append('path')
              .attr('d', this.#getPriceTextBackgroundPath({
                axis: this.#axis.yLeft,
                orient: 'left',
              }))
              .attr('class', 'price-line-left-background');
            leftLabelGroup.append('text')
              .attr('class', 'price-line-left-label');

            // --- right label ---
            const rightLabelGroup = wrapper.append('g')
              .attr('class', 'price-line-right-group')
              .attr('transform', `translate(${this.#resizeData.width}, 0)`);

            rightLabelGroup.append('path')
              .attr('d', this.#getPriceTextBackgroundPath({
                axis: this.#axis.yRight,
                orient: 'right',
              }))
              .attr('class', 'price-line-right-background');
            rightLabelGroup.append('text')
              .attr('class', 'price-line-right-label');

            const updateWrapper = convertType<
            d3.Selection<d3.BaseType, PriceLinesDatum, SVGGElement, unknown>
            >(wrapper);
            updateHandler(updateWrapper, 'left', this.#axis.yLeft);
            updateHandler(updateWrapper, 'right', this.#axis.yRight);
            return wrapper;
          },
          (update) => {
            updateHandler(update, 'left', this.#axis.yLeft);
            updateHandler(update, 'right', this.#axis.yRight);
            return update;
          },
          (exit) => exit.remove(),
        );

      /* const enterred = selection.enter()

      if (this.#showY) {
        const leftLabel = enterred.append('g');

        leftLabel

      }

      selection.exit().remove(); */
    }
  };

  #getPriceTextCoords = ({
    axis, orient, value,
  }: {
    axis: d3.Axis<d3.NumberValue>;
    orient: Orient;
    value: number;
  }): [number, number] => {
    const scale = axis.scale();

    switch (orient) {
      case 'left':
        return [200, scale(value) || 0];
      case 'right':
        return [0, scale(value) || 0];
      case 'top':
      case 'bottom':
        return [scale(value) || 0, 0];
      default:
        return [0, 0];
    }
  };

  #getPriceTextBackgroundPath = ({
    axis, orient,
  }: { axis: d3.Axis<d3.NumberValue>, orient: Orient }): string => {
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

  #setPriceTextAttributes = ({
    axis, orient, textSelection,
  }: {
    axis: d3.Axis<d3.NumberValue>;
    orient: Orient;
    textSelection: d3.Selection<SVGTextElement, PriceLinesDatum, SVGGElement, unknown>;
  }): void => {
    const neg = orient === 'left' || orient === 'top' ? -1 : 1;

    switch (orient) {
      case 'left':
      case 'right':
        textSelection.attr('x', neg * (Math.max(axis.tickSizeInner(), 0) + axis.tickPadding()))
          .attr('y', 0)
          .attr('dy', '.32em')
          .style('text-anchor', neg < 0 ? 'end' : 'start')
          .text(({ yValue }) => String(yValue));
        break;
      case 'top':
      case 'bottom':
        textSelection.attr('x', 0)
          .attr('y', neg * (Math.max(axis.tickSizeInner(), 0) + axis.tickPadding()))
          .attr('dy', neg < 0 ? '0em' : '.72em')
          .style('text-anchor', 'middle')
          .text(({ xValue }) => String(xValue));
        break;
      default:
    }
  };
}
