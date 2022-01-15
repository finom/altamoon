import * as d3 from 'd3';
import {
  ChartItem, D3Selection, DrawData, Scales,
} from '../types';
import * as api from '../../../../../api';

export default class Ema implements ChartItem {
  #scaledX: Scales['x'];

  #scaledY: Scales['y'];

  #curve1?: D3Selection<SVGPathElement>;

  #curve2?: D3Selection<SVGPathElement>;

  #curve3?: D3Selection<SVGPathElement>;

  #curve4?: D3Selection<SVGPathElement>;

  #emaNumbers: [number, number, number, number] = [1, 1, 1, 1];

  #emaColors: [string, string, string, string] = ['red', 'green', 'blue', 'yellow'];

  constructor({ scales }: { scales: Scales }) {
    this.#scaledX = scales.x;
    this.#scaledY = scales.y;
  }

  public appendTo = (parent: Element): void => {
    const container = d3.select(parent).append('g').attr('clip-path', 'url(#clipChart)');

    this.#curve1 = container.append('path').attr('fill', 'none');
    this.#curve2 = container.append('path').attr('fill', 'none');
    this.#curve3 = container.append('path').attr('fill', 'none');
    this.#curve4 = container.append('path').attr('fill', 'none');
  };

  public draw({ candles }: DrawData): void {
    const curve = d3.line().curve(d3.curveNatural);

    this.#curve1?.attr('stroke', this.#emaColors[0]).attr('d', curve(this.#calcEma(candles, this.#emaNumbers[0])));
    this.#curve2?.attr('stroke', this.#emaColors[1]).attr('d', curve(this.#calcEma(candles, this.#emaNumbers[1])));
    this.#curve3?.attr('stroke', this.#emaColors[2]).attr('d', curve(this.#calcEma(candles, this.#emaNumbers[2])));
    this.#curve4?.attr('stroke', this.#emaColors[3]).attr('d', curve(this.#calcEma(candles, this.#emaNumbers[3])));
  }

  public resize = (): void => {
    // none
  };

  public update = (data: {
    scaledX?: d3.ScaleTime<number, number>;

    shouldShowEma?: [boolean, boolean, boolean, boolean];
    emaNumbers?: [number, number, number, number];
    emaColors?: [string, string, string, string];
  }): void => {
    if (typeof data.scaledX !== 'undefined') this.#scaledX = data.scaledX;

    if (typeof data.shouldShowEma !== 'undefined') {
      this.#curve1?.style('display', data.shouldShowEma[0] ? '' : 'none');
      this.#curve2?.style('display', data.shouldShowEma[1] ? '' : 'none');
      this.#curve3?.style('display', data.shouldShowEma[2] ? '' : 'none');
      this.#curve4?.style('display', data.shouldShowEma[3] ? '' : 'none');
    }

    if (typeof data.emaNumbers !== 'undefined') this.#emaNumbers = data.emaNumbers;
    if (typeof data.emaColors !== 'undefined') this.#emaColors = data.emaColors;
  };

  #calcEma = (candles: api.FuturesChartCandle[], N: number) => {
    let ema = 0;
    const k = 2 / (N + 1);

    const result: [number, number][] = [];

    for (let i = 0; i < candles.length; i += 1) {
      ema = candles[i].close * k + ema * (1 - k);
      result.push([this.#scaledX(candles[i].time), this.#scaledY(ema)]);
    }

    return result.slice(N * 2, result.length);
  };
}
