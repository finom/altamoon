import * as d3 from 'd3';
import {
  ChartItem, D3Selection, DrawData, Scales,
} from '../types';
import * as api from '../../../../../api';

export default class Ema implements ChartItem {
  #scaledX: Scales['x'];

  #scaledY: Scales['y'];

  #upperLines?: D3Selection<SVGGElement>;

  #lowerLines?: D3Selection<SVGGElement>;

  #period = 10;

  #multiplier = 3;

  #upperColor = 'red';

  #lowerColor = 'green';

  constructor({ scales }: { scales: Scales }) {
    this.#scaledX = scales.x;
    this.#scaledY = scales.y;
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public appendTo = (parent: Element): void => {
    // const container = d3.select(parent).append('g').attr('clip-path', 'url(#clipChart)');

    // this.#upperLines = container.append('g');
    // this.#lowerLines = container.append('g');
  };

  public draw({ candles }: DrawData): void {
    const curve = d3.line().curve(d3.curveLinear);

    const { upper, lower } = this.#calcSupertrend(candles);

    this.#upperLines
      ?.selectAll('path')
      .data(upper)
      .join(
        (enter) => enter
          .append('path')
          .attr('d', (d) => curve(d))
          .attr('fill', 'none')
          .attr('stroke', this.#upperColor),
        (update) => update
          .attr('d', (d) => curve(d)),
        (exit) => exit.remove(),
      );

    this.#lowerLines
      ?.selectAll('path')
      .data(lower)
      .join(
        (enter) => enter
          .append('path')
          .attr('d', (d) => curve(d))
          .attr('fill', 'none')
          .attr('stroke', this.#lowerColor),
        (update) => update
          .attr('d', (d) => curve(d)),
        (exit) => exit.remove(),
      );
  }

  public resize = (): void => {
    // none
  };

  public update = (data: {
    scaledX?: d3.ScaleTime<number, number>;

    shouldShowSupertrend?: boolean;
    emaNumbers?: [number, number, number, number];
    emaColors?: [string, string, string, string];
  }): void => {
    if (typeof data.scaledX !== 'undefined') this.#scaledX = data.scaledX;

    if (typeof data.shouldShowSupertrend !== 'undefined') {
      this.#upperLines?.style('display', data.shouldShowSupertrend ? '' : 'none');
      this.#lowerLines?.style('display', data.shouldShowSupertrend ? '' : 'none');
    }
  };

  #calcSupertrend = (
    candles: api.FuturesChartCandle[],
  ): { upper: [number, number][][], lower: [number, number][][] } => {
    let FINAL_UPPERBAND = 0;
    let FINAL_LOWERBAND = 0;
    const period = this.#period;
    const multiplier = this.#multiplier;

    // contains an array of lines (line is an array of [x, y] tuples)
    const lower: [number, number][][] = [[]];
    const upper: [number, number][][] = [[]];

    const trueRanges: number[] = [];

    for (let i = 1; i < candles.length; i += 1) {
      const candle = candles[i];
      const prevCandle = candles[i - 1];
      const D1 = candle.high - candle.low;
      const D2 = Math.abs(candle.high - prevCandle.close);
      const D3 = Math.abs(prevCandle.close - candle.low);
      const TR = Math.max(D1, D2, D3);

      trueRanges.push(TR);

      // ATR = ((ATR * (period - 1)) + TR) / period;

      const ATR = trueRanges.slice(-period).reduce((a, c) => a + c, 0)
        / Math.min(period, trueRanges.length);

      const BASIC_UPPERBAND = (candle.high + candle.low) / 2 + multiplier * ATR;
      const BASIC_LOWERBAND = (candle.high + candle.low) / 2 - multiplier * ATR;
      // https://github.com/jigneshpylab/ZerodhaPythonScripts/blob/master/supertrend.py
      FINAL_UPPERBAND = i === 1
        || BASIC_UPPERBAND < FINAL_UPPERBAND
        || prevCandle.close > FINAL_UPPERBAND
        ? BASIC_UPPERBAND
        : FINAL_UPPERBAND;

      FINAL_LOWERBAND = i === 1
        || BASIC_LOWERBAND > FINAL_LOWERBAND
        || prevCandle.close < FINAL_LOWERBAND
        ? BASIC_LOWERBAND
        : FINAL_LOWERBAND;

      const isUpper = candle.close <= FINAL_UPPERBAND;

      const SUPERTREND = isUpper ? FINAL_UPPERBAND : FINAL_LOWERBAND;

      if (isUpper) {
        // add a point to the last line
        upper[upper.length - 1].push(
          [this.#scaledX(candle.time), this.#scaledY(SUPERTREND)],
        );

        // "reset" opposite direction line
        if (lower[lower.length - 1].length) {
          lower.push([]);
        }
      } else { // repeat the same for lower lines
        lower[lower.length - 1].push(
          [this.#scaledX(candle.time), this.#scaledY(SUPERTREND)],
        );

        if (upper[upper.length - 1].length) {
          upper.push([]);
        }
      }
    }

    return { upper, lower };
  };
}
