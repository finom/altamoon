import * as d3 from 'd3';
import moment from 'moment';

import * as api from '../../../api';
import formatMoneyNumber from '../../formatMoneyNumber';
import {
  ChartItem, Scales, D3Selection,
} from '../types';

const ARROW_SIZE = 10;

const TRIANGLE_OPACITY = 0.8;

export default class OrderArrows implements ChartItem {
  #scaledX: Scales['x'];

  #scaledY: Scales['y'];

  #wrapper?: D3Selection<SVGGElement>;

  #tooltipWrapper?: D3Selection<SVGForeignObjectElement>;

  #tooltip?: D3Selection<HTMLDivElement>;

  #zIndexHack?: D3Selection<SVGUseElement>;

  #filledOrders: api.FuturesOrder[] = [];

  constructor({ scales }: { scales: Scales }) {
    this.#scaledX = scales.x;
    this.#scaledY = scales.y;
  }

  public appendTo = (parent: Element): void => {
    const wrapper = d3.select(parent).append('g')
      .attr('class', 'order-arrows-wrapper')
      .attr('clip-path', 'url(#clipChart)');
    const tooltipWrapper = d3.select(parent).append('foreignObject')
      .attr('class', 'order-arrows-tooltip-wrapper');
    const tooltip = tooltipWrapper.append('xhtml:div') as D3Selection<HTMLDivElement>;

    this.#wrapper = wrapper;
    this.#tooltipWrapper = tooltipWrapper;
    this.#tooltip = tooltip;

    tooltip.style('display', 'none');

    this.#zIndexHack = d3.select(parent).append('use').style('pointer-events', 'none');
  };

  // eslint-disable-next-line class-methods-use-this
  public resize(): void {
    // none
  }

  public update = (data: {
    scaledX?: d3.ScaleTime<number, number>,
    filledOrders?: api.FuturesOrder[],
  }): void => {
    if (typeof data.scaledX !== 'undefined') {
      this.#scaledX = data.scaledX;
    }

    if (typeof data.filledOrders !== 'undefined') {
      this.#filledOrders = data.filledOrders;
    }

    this.draw();
  };

  public draw = (): void => {
    const points = (d: api.FuturesOrder): string => {
      const x = this.#scaledX(d.updateTime);
      const y = this.#scaledY(+d.avgPrice);
      const size = ARROW_SIZE;

      return `${-size + x},${y - size / 2} ${-size + x},${y + size / 2} ${x},${y}`; // right
    };

    this.#wrapper
      ?.selectAll('polygon')
      .data(this.#filledOrders, (d) => (d as api.FuturesOrder).orderId)
      .join((enter) => enter
        .append('polygon')
        .attr('fill', (d) => (d.side === 'BUY' ? 'var(--biduul-buy-color)' : 'var(--biduul-sell-color)'))
        .attr('stroke-width', 1)
        .attr('id', (d) => `order_${d.orderId}`)
        .attr('points', points)
        .attr('stroke-linejoin', 'round')
        .style('opacity', TRIANGLE_OPACITY)
        .on('mouseenter', (evt: MouseEvent & { target: SVGElement }, d) => {
          const x = this.#scaledX(d.updateTime);
          const y = this.#scaledY(+d.avgPrice);

          // eslint-disable-next-line no-param-reassign
          evt.target.style.opacity = '1';

          this.#zIndexHack?.attr('xlink:href', `#order_${d.orderId}`);

          // TODO support different base assets
          this.#tooltip
            ?.style('display', '')
            .html(`
            <p><em>${moment(d.updateTime).format('lll')}</em></p>
            <p><strong>${d.executedQty} ${d.symbol.replace('USDT', '')}</strong> (${formatMoneyNumber(+d.executedQty * +d.avgPrice)} ₮)</p>
            <p>1 ${d.symbol.replace('USDT', '')} = ${+d.avgPrice} ₮</p>
          `)
            .style('background-color', d.side === 'BUY' ? 'var(--biduul-buy-color)' : 'var(--biduul-sell-color)');

          const width = parseInt(this.#tooltip?.style('width') ?? '0', 10);
          const height = parseInt(this.#tooltip?.style('height') ?? '0', 10);

          this.#tooltipWrapper
            ?.attr('x', x - width - ARROW_SIZE)
            .attr('y', Math.max(10, y - ARROW_SIZE / 2 - height / 2));
        })
        .on('mouseleave', (evt: MouseEvent & { target: SVGElement }) => {
          // eslint-disable-next-line no-param-reassign
          evt.target.style.opacity = TRIANGLE_OPACITY.toString();

          this.#tooltip?.style('display', 'none');
          this.#zIndexHack?.attr('xlink:href', '');
        }),
      (update) => update.attr('points', points),
      (exit) => exit.remove());
  };
}
