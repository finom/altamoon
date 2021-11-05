import * as d3 from 'd3';
import {
  ChartItem, D3Selection, ResizeData, Scales,
} from '../types';

const ARROW_SIZE = 10;

interface MarkPriceDatum {
  markPrice: number;
}

export default class MarkPriceTriangle implements ChartItem {
  #scaledX: Scales['x'];

  #scaledY: Scales['y'];

  #triangle?: D3Selection<SVGPolygonElement>;

  #markPrice?: number;

  #tooltipWrapper?: D3Selection<SVGForeignObjectElement>;

  #tooltip?: D3Selection<HTMLDivElement>;

  constructor({ scales }: { scales: Scales }) {
    this.#scaledX = scales.x;
    this.#scaledY = scales.y;
  }

  public appendTo = (parent: Element, resizeData: ResizeData): void => {
    this.#triangle = d3.select(parent).append('g').append('polygon');

    const tooltipWrapper = d3.select(parent).append('foreignObject')
      .attr('class', 'order-arrows-tooltip-wrapper');
    const tooltip = tooltipWrapper.append('xhtml:div') as D3Selection<HTMLDivElement>;

    this.#tooltipWrapper = tooltipWrapper;
    this.#tooltip = tooltip;

    tooltip.style('display', 'none');
  };

  // eslint-disable-next-line class-methods-use-this
  public resize(): void {
    // none
  }

  public update = (data: {
    markPrice?: number,
  }): void => {
    if (typeof data.markPrice !== 'undefined') {
      this.#markPrice = data.markPrice;
    }

    this.draw();
  };

  public draw = (): void => {
    const points = (d: MarkPriceDatum): string => {
      const x = 100;
      const y = this.#scaledY(d.markPrice);
      const size = ARROW_SIZE;

      return `${-size + x},${y - size / 2} ${-size + x},${y + size / 2} ${x},${y}`; // right
    };

    this.#triangle
      ?.data(
        [{ markPrice: this.#markPrice } as MarkPriceDatum],
        (d) => (d as MarkPriceDatum).markPrice,
      )
      .join((enter) => enter
        .append('polygon')
        .attr('fill', 'var(--bs-warning-color)')
        .attr('stroke-width', 1)
        .attr('points', points)
        .attr('stroke-linejoin', 'round'),
      /* .on('mouseenter', (evt: MouseEvent & { target: SVGElement }, d) => {
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
            <p><strong>${d.executedQty} ${d.symbol.replace('USDT', '')}</strong>
            (${formatMoneyNumber(+d.executedQty * +d.avgPrice)} ₮)</p>
            <p>1 ${d.symbol.replace('USDT', '')} = ${+d.avgPrice} ₮</p>
          `)
            .style('background-color', d.side === 'BUY'
            ? 'var(--biduul-buy-color)' : 'var(--biduul-sell-color)');

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
        }) */
      (update) => update.attr('points', points),
      (exit) => exit.remove());
  };
}
