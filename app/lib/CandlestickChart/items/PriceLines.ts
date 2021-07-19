import * as d3 from 'd3';
import { TodoAny } from '../../../types';
import convertType from '../../convertType';
import {
  ChartAxis, ChartItem, D3Selection, PriceLinesDatum, ResizeData,
} from '../types';

type Orient = 'top' | 'bottom' | 'left' | 'right';

type Handler = (datum: PriceLinesDatum, d: PriceLinesDatum[]) => void;

interface Params {
  items: PriceLinesDatum[];
  axis: ChartAxis;
  showX?: boolean;
  color?: string;
  isVisible?: boolean;
  isTitleVisible?: boolean;
  isBackgroundFill?: boolean;
  lineStyle?: 'solid' | 'dashed' | 'dotted';
  pointerEventsNone?: boolean;
  onDragEnd?: Handler;
  onClickClose?: Handler;
  onClickCheck?: Handler;
}

export default class PriceLines implements ChartItem {
  #wrapper?: D3Selection<SVGGElement>;

  #parent?: D3Selection<SVGElement>;

  #items: PriceLinesDatum[];

  #draggableItemIndex: number | null = null;

  readonly #showX: boolean;

  readonly #color;

  readonly #axis: ChartAxis;

  #lineStyle: 'solid' | 'dashed' | 'dotted';

  #pricePrecision = 1;

  readonly #isTitleVisible: boolean;

  readonly #isBackgroundFill: boolean;

  readonly #pointerEventsNone: boolean;

  #resizeData: ResizeData;

  #handleDragEnd?: Handler;

  #handleClickClose?: Handler;

  #handleClickCheck?: Handler;

  constructor(
    {
      items, axis, showX, color, lineStyle, isTitleVisible, isBackgroundFill,
      pointerEventsNone, onDragEnd, onClickClose, onClickCheck,
    }: Params,
    resizeData: ResizeData,
  ) {
    this.#items = items;
    this.#axis = axis;
    this.#resizeData = resizeData;
    this.#showX = !!showX;
    this.#color = color ?? '#ff00ff';
    this.#lineStyle = lineStyle ?? 'solid';
    this.#isTitleVisible = isTitleVisible ?? false;
    this.#isBackgroundFill = isBackgroundFill ?? false;
    this.#pointerEventsNone = !!pointerEventsNone;
    this.#handleDragEnd = onDragEnd;
    this.#handleClickClose = onClickClose;
    this.#handleClickCheck = onClickCheck;
  }

  public appendTo = (
    parent: Element,
    resizeData: ResizeData,
    { wrapperCSSStyle }: { wrapperCSSStyle?: Partial<CSSStyleDeclaration> } = {},
  ): void => {
    this.#parent = convertType<D3Selection<SVGElement>>(d3.select(parent));

    this.#wrapper = this.#parent.append('g');

    Object.assign(this.#wrapper.node()?.style ?? {}, wrapperCSSStyle ?? {});

    this.update({ items: this.#items });

    this.resize(resizeData);
  };

  public resize = (resizeData: ResizeData): void => {
    this.#resizeData = resizeData;

    this.#wrapper?.selectAll('.price-line-right-group')
      .attr('transform', `translate(${resizeData.width}, 0)`);

    this.#wrapper?.selectAll('.price-line-bottom-group')
      .attr('transform', `translate(0, ${this.#resizeData.height})`);

    // --- line ---
    this.#wrapper?.selectAll('.price-line-horizontal-group .price-line-line').attr('x2', resizeData.width);
    this.#wrapper?.selectAll('.price-line-vertical-group .price-line-line').attr('y2', resizeData.height);

    this.#wrapper?.selectAll('.price-line-title-object').attr('transform', `translate(${this.#resizeData.width - 120}, 0)`);

    this.#draw();
  };

  public update(data: { items?: PriceLinesDatum[]; pricePrecision?: number; } = {}): void {
    if (!this.#wrapper) return;

    if (typeof data.pricePrecision !== 'undefined') {
      this.#pricePrecision = data.pricePrecision;
    }

    if (typeof data.items !== 'undefined') {
      this.#items = data.items;
    }

    this.#draw();
  }

  public empty = (): void => this.update({ items: [] });

  public updateItem = (key: number | string, data: PriceLinesDatum): void => {
    const item = typeof key === 'string' ? this.#items.find(({ id }) => id === key) : this.#items[key];
    if (!item) throw new Error(`Unable to find item "${key}"`);
    Object.assign(item, data);
    this.update({ items: this.#items });
  };

  public addItem = (data: PriceLinesDatum): void => {
    this.#items.push(data);
    this.update({ items: this.#items });
  };

  public removeItem = (key: number | string): void => {
    const item = typeof key === 'string' ? this.#items.find(({ id }) => id === key) : this.#items[key];
    if (!item) throw new Error(`Unable to find item "${key}"`);
    this.#items.splice(this.#items.indexOf(item), 1);
    this.update({ items: this.#items });
  };

  public invertX = (px: number): Date => convertType<{ invert:(px: number) => Date }>(
    this.#axis.x.scale()).invert(px);

  public invertY = (px: number): number => convertType<{ invert:(px: number) => number }>(
    this.#axis.yLeft.scale()).invert(px);

  public getItems = (): PriceLinesDatum[] => this.#items;

  #draw = (): void => {
    if (!this.#wrapper) return;
    const updateHorizontalLineHandler = (
      update: d3.Selection<d3.BaseType, PriceLinesDatum, SVGGElement, unknown>,
      orient: Orient,
      axis: d3.Axis<d3.NumberValue>,
    ): d3.Selection<d3.BaseType, PriceLinesDatum, SVGGElement, unknown> => {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      const textSelection = update.select(`.price-line-${orient}-label`) as d3.Selection<SVGTextElement, PriceLinesDatum, SVGGElement, unknown>;
      update
        .select('.price-line-horizontal-group')
        .attr('transform', (d) => `translate(0, ${String(axis.scale()(d.yValue ?? 0))})`)
        .attr('color', ({ color }) => color ?? this.#color)
        .style('visibility', ({ isVisible }) => (typeof isVisible === 'undefined' || isVisible ? '' : 'hidden'));

      this.#setPriceTextAttributes({
        textSelection,
        axis,
        orient,
      });

      return update;
    };

    const updateVerticalLineHandler = (
      update: d3.Selection<d3.BaseType, PriceLinesDatum, SVGGElement, unknown>,
      axis: d3.Axis<d3.NumberValue>,
    ): d3.Selection<d3.BaseType, PriceLinesDatum, SVGGElement, unknown> => {
      if (!this.#showX) return update;
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      const textSelection = update.select('.price-line-bottom-label') as d3.Selection<SVGTextElement, PriceLinesDatum, SVGGElement, unknown>;
      update
        .select('.price-line-vertical-group')
        .attr('transform', (d) => `translate(${String(axis.scale()(d.xValue ?? 0))}, 0)`)
        .attr('color', ({ color }) => color ?? this.#color)
        .style('visibility', ({ isVisible }) => (typeof isVisible === 'undefined' || isVisible ? '' : 'hidden'));

      this.#setPriceTextAttributes({
        textSelection,
        axis,
        orient: 'bottom',
      });

      return update;
    };

    this.#wrapper
      .selectAll('.price-line-wrapper')
      .data(this.#items)
      .join(
        (enter) => {
          // --- horizontal line ---
          const wrapper = enter.append('g').attr('class', 'price-line-wrapper');

          if (this.#pointerEventsNone) {
            wrapper.style('pointer-events', 'none');
          }

          wrapper.style('cursor', (d) => (d.isDraggable ? 'ns-resize' : 'auto'));

          const horizontalWrapper = wrapper.append('g').attr('class', 'price-line-horizontal-group');

          // --- line ---
          const horizontalLine = horizontalWrapper.append('line')
            .attr('x1', 0)
            .attr('y1', 0)
            .attr('x2', this.#resizeData.width)
            .attr('y2', 0)
            .attr('stroke', 'currentColor')
            .attr('class', 'price-line-line');

          if (this.#lineStyle !== 'solid') {
            horizontalLine.attr('stroke-dasharray', this.#lineStyle === 'dashed' ? '10 7' : '2 4');
          }

          // --- dragging ---
          // eslint-disable-next-line @typescript-eslint/no-this-alias
          const that = this;
          horizontalWrapper.select(function selector(d) {
            if (!d.isDraggable) return this;

            const horizontalWrapperItem = d3.select(this);

            horizontalWrapperItem.append('rect')
              .attr('class', 'price-line-handle')
              .attr('x', 0)
              .attr('y', -5)
              .attr('width', that.#resizeData.width)
              .attr('height', 10)
              .attr('fill', 'transparent');

            horizontalWrapperItem.call(
              d3.drag<Element, PriceLinesDatum>()
                .on('start', that.#onDragStart)
                .on('drag', that.#onDrag)
                .on('end', (_evt, datum) => that.#onDragEnd(datum)) as TodoAny,
            );

            return this;
          });

          // --- line note ---
          if (this.#isTitleVisible) {
            // for some reason event datum (2nd argument of d3.Selection#on method)
            // provides wrong datum value, that's why the dirty hack is used
            const getDatumFromTarget = (target: HTMLElement | SVGForeignObjectElement) => {
              const foreignObject = target.closest('.price-line-title-object');
              // eslint-disable-next-line no-underscore-dangle
              return this.#items[convertType<{ _datumIndex: number }>(foreignObject)._datumIndex];
            };

            const titleGroup = horizontalWrapper.append('foreignObject')
              .attr('class', 'price-line-title-object')
              .attr('transform', `translate(${this.#resizeData.width - 120}, 0)`)
              .attr('x', 0)
              .attr('y', -12)
              .attr('width', 110)
              .attr('height', 24)
              .property('_datumIndex', (d) => this.#items.indexOf(d))
              .on('mouseenter', ({ target }: { target: SVGForeignObjectElement }) => {
                const datum = getDatumFromTarget(target);
                const check: HTMLElement | null = target.querySelector('.check');
                if (check) check.hidden = !datum.isCheckable;
              })
              .on('mouseleave', ({ target }: { target: SVGForeignObjectElement }) => {
                const check: HTMLElement | null = target.querySelector('.check');
                if (check) check.hidden = true;
              });

            const div = titleGroup.append('xhtml:div')
              .attr('class', 'price-line-title-inner')
              .style('border', '1px solid currentColor')
              .style('border-radius', '4px')
              .style('padding', '5px 10px')
              .style('pointer-events', 'none');

            div.append('xhtml:span').attr('class', 'text').style('color', '#fff');

            if (this.#handleClickClose) {
              div.append('xhtml:span')
                .property('textContent', '×')
                .property('className', 'nodrag')
                .style('color', 'var(--bs-red)')
                .style('font-size', '1.3rem')
                .style('line-height', 1)
                .style('margin-top', '-5px')
                .style('margin-left', '3px')
                .style('float', 'right')
                .style('cursor', 'pointer')
                .style('pointer-events', 'auto')
                .on('click', (evt: { target: HTMLElement }) => {
                  this.#handleClickClose?.(getDatumFromTarget(evt.target), this.#items);
                });
            }

            if (this.#handleClickCheck) {
              div.append('xhtml:span')
                .property('textContent', '✔')
                .property('className', 'check nodrag')
                .property('hidden', true)
                .style('color', 'var(--bs-green)')
                .style('font-size', '1rem')
                .style('line-height', 1)
                .style('margin-top', '-1px')
                .style('float', 'right')
                .style('cursor', 'pointer')
                .style('pointer-events', 'auto')
                .on('click', (evt: { target: HTMLElement }) => {
                  this.#handleClickCheck?.(getDatumFromTarget(evt.target), this.#items);
                });
            }
          }

          // --- left label ---
          const leftLabelGroup = horizontalWrapper.append('g').attr('class', 'price-line-left-group');
          leftLabelGroup.append('path')
            .attr('d', this.#getPriceTextBackgroundPath({
              axis: this.#axis.yLeft,
              orient: 'left',
            }))
            .attr('class', 'price-line-left-background')
            .attr('fill', 'currentColor');

          leftLabelGroup.append('text').attr('class', 'price-line-left-label');

          // --- right label ---
          const rightLabelGroup = horizontalWrapper.append('g')
            .attr('class', 'price-line-right-group')
            .attr('transform', `translate(${this.#resizeData.width}, 0)`);

          rightLabelGroup.append('path')
            .attr('d', this.#getPriceTextBackgroundPath({
              axis: this.#axis.yRight,
              orient: 'right',
            }))
            .attr('class', 'price-line-right-background')
            .attr('fill', 'currentColor');

          rightLabelGroup.append('text')
            .attr('class', 'price-line-right-label')
            .attr('fill', '#fff');

          // vertical line
          if (this.#showX) {
            const verticalWrapper = wrapper.append('g').attr('class', 'price-line-vertical-group');

            // --- line ---
            const verticalLine = verticalWrapper.append('line')
              .attr('x1', 1)
              .attr('y1', 0)
              .attr('x2', 1)
              .attr('y2', this.#resizeData.height)
              .attr('stroke', 'currentColor')
              .attr('class', 'price-line-line');

            if (this.#lineStyle !== 'solid') {
              verticalLine.attr('stroke-dasharray', this.#lineStyle === 'dashed' ? '10 7' : '2 4');
            }

            // --- left label ---
            const bottomLabelGroup = verticalWrapper.append('g')
              .attr('class', 'price-line-bottom-group')
              .attr('transform', `translate(0, ${this.#resizeData.height})`);
            bottomLabelGroup.append('path')
              .attr('d', this.#getPriceTextBackgroundPath({
                axis: this.#axis.x,
                orient: 'bottom',
              }))
              .attr('class', 'price-line-bottom-background')
              .attr('fill', 'currentColor');
            bottomLabelGroup.append('text')
              .attr('class', 'price-line-bottom-label');
          }

          // --- initial update ---
          const updateWrapper = convertType<
          d3.Selection<d3.BaseType, PriceLinesDatum, SVGGElement, unknown>
          >(wrapper);
          updateHorizontalLineHandler(updateWrapper, 'left', this.#axis.yLeft);
          updateHorizontalLineHandler(updateWrapper, 'right', this.#axis.yRight);
          updateVerticalLineHandler(updateWrapper, this.#axis.x);
          if (this.#isTitleVisible) {
            updateWrapper.select('.price-line-title-object .text').text(({ title }) => title ?? '');
            updateWrapper.select('.price-line-title-object .price-line-title-inner')
              .style('background-color', (d) => (this.#isBackgroundFill && d.color ? d.color : '#010025'));
          }

          return wrapper;
        },
        (update) => {
          updateHorizontalLineHandler(update, 'left', this.#axis.yLeft);
          updateHorizontalLineHandler(update, 'right', this.#axis.yRight);
          updateVerticalLineHandler(update, this.#axis.x);
          if (this.#isTitleVisible) {
            update.select('.price-line-title-object .text').text(({ title }) => title ?? '');
            update.select('.price-line-title-object .price-line-title-inner')
              .style('background-color', (d) => (this.#isBackgroundFill && d.color ? d.color : '#010025'));
          }
          return update;
        },
        (exit) => exit.remove(),
      );
  };

  #getPriceTextBackgroundPath = ({
    axis, orient,
  }: { axis: d3.Axis<d3.NumberValue>, orient: Orient }): string => {
    const height = 14;
    const point = 4;
    const neg = orient === 'left' || orient === 'top' ? -1 : 1;

    const value = 1;
    let pt = point;

    switch (orient) {
      case 'left':
      case 'right': {
        const width = 50;
        let h = 0;

        if (height / 2 < point) pt = height / 2;
        else h = height / 2 - point;

        return `M 0 ${value} l ${neg * Math.max(axis.tickSizeInner(), 1)} ${-pt
        } l 0 ${-h} l ${neg * width} 0 l 0 ${height
        } l ${neg * -width} 0 l 0 ${-h}`;
      }
      case 'top':
      case 'bottom': {
        const width = 100;
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
          .text(({ yValue }) => d3.format(`,.${this.#pricePrecision}f`)(yValue ?? 0));
        break;
      case 'top':
      case 'bottom':
        textSelection.attr('x', 0)
          .attr('y', neg * (Math.max(axis.tickSizeInner(), 0) + axis.tickPadding()))
          .attr('dy', neg < 0 ? '0em' : '.72em')
          .style('text-anchor', 'middle')
          .text(({ xValue }) => (xValue ? d3.timeFormat('%-d/%-m/%Y %-H:%M:%S')(xValue) : ''));
        break;
      default:
    }
  };

  #onDragStart = (evt: { sourceEvent: { target: Element } }, datum: PriceLinesDatum): void => {
    // nodrag hack fixes issue when user pulls the line at close button
    // and coordinates become eqial to zero
    if (!evt.sourceEvent.target.closest('.nodrag')) {
      this.#draggableItemIndex = this.#items.indexOf(datum);
    }
  };

  #onDrag = (evt: { sourceEvent: MouseEvent }): void => {
    if (this.#draggableItemIndex === null) return;

    this.updateItem(this.#draggableItemIndex, {
      yValue: this.invertY(evt.sourceEvent.offsetY),
    });
  };

  #onDragEnd = (datum: PriceLinesDatum): void => {
    this.#draggableItemIndex = null;
    this.#handleDragEnd?.(datum, this.#items);
  };
}
