import * as d3 from 'd3';
import { ChartItem, D3Selection, Scales } from '../types';

const ARROW_SIZE = 10;

interface MarkPriceDatum {
  markPrice: number;
}

export default class MarkPriceTriangle implements ChartItem {
  #scaledY: Scales['y'];

  #wrapper?: D3Selection<SVGGElement>;

  #markPrice = 0;

  #axisRight?: D3Selection<SVGGElement>;

  #tooltipWrapper?: D3Selection<SVGForeignObjectElement>;

  #tooltip?: D3Selection<HTMLDivElement>;

  #pricePrecision = 0;

  constructor({ scales }: { scales: Scales }) {
    this.#scaledY = scales.y;
  }

  public appendTo = (parent: Element): void => {
    this.#wrapper = d3.select(parent).append('g');

    const axisRight = d3.select(parent).select<SVGGElement>('.y.axis.right');

    if (!axisRight) {
      throw new Error('Unable to find element "g.y.axis.right"');
    }

    this.#axisRight = axisRight;

    const tooltipWrapper = d3.select(parent).append('foreignObject')
      .attr('class', 'tooltip-wrapper');
    const tooltip = tooltipWrapper.append<HTMLDivElement>('xhtml:div');

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
    scaledX?: d3.ScaleTime<number, number>,
    pricePrecision?: number;
  }): void => {
    if (typeof data.markPrice !== 'undefined') {
      this.#markPrice = data.markPrice;
    }

    if (typeof data.pricePrecision !== 'undefined') {
      this.#pricePrecision = data.pricePrecision;
    }

    this.#tooltip?.html(`<p>Mark price: ${(data.markPrice ?? 0).toFixed(this.#pricePrecision)}</p>`);
    this.draw();
  };

  public draw = (): void => {
    // get transform(X) value from the axis element
    const getAxisTransformLeft = () => {
      const matrix = Array.from(this.#axisRight?.node()?.transform.baseVal ?? [])
        .find(({ type }) => type === 2)?.matrix;
      return matrix?.e ?? 0;
    };

    const points = (d: MarkPriceDatum): string => {
      const x = getAxisTransformLeft();
      const y = this.#scaledY(d.markPrice);
      const size = ARROW_SIZE;

      return `${-size + x},${y - size / 2} ${-size + x},${y + size / 2} ${x},${y}`; // right
    };

    this.#wrapper
      ?.selectAll('polygon')
      .data(
        [{ markPrice: +this.#markPrice } as MarkPriceDatum],
      )
      .join((enter) => enter
        .append('polygon')
        .attr('fill', 'var(--bs-warning)')
        .attr('stroke-width', 1)
        .attr('points', points)
        .attr('stroke-linejoin', 'round')
        .on('mouseenter', (_evt, d) => {
          this.#tooltip
            ?.style('display', '')
            .style('background-color', 'var(--bs-warning)');

          const width = parseInt(this.#tooltip?.style('width') ?? '0', 10);
          const height = parseInt(this.#tooltip?.style('height') ?? '0', 10);

          const x = getAxisTransformLeft();
          const y = this.#scaledY(d.markPrice);

          this.#tooltipWrapper
            ?.attr('x', x - width - ARROW_SIZE)
            .attr('y', y - height / 2);
        })
        .on('mouseleave', () => {
          this.#tooltip?.style('display', 'none');
        }),
      (update) => update.attr('points', points),
      (exit) => exit.remove());
  };
}
