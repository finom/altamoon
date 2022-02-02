import * as d3 from 'd3';
import {
  ChartItem, D3Selection, DrawData, Scales,
} from '../types';
import * as api from '../../../../../api';

/*
SuperTrend Algorithm :
        BASIC UPPERBAND = (HIGH + LOW) / 2 + Multiplier * ATR
        BASIC LOWERBAND = (HIGH + LOW) / 2 - Multiplier * ATR
        FINAL UPPERBAND = IF( (Current BASICUPPERBAND < Previous FINAL UPPERBAND) or (Previous Close > Previous FINAL UPPERBAND))
                            THEN (Current BASIC UPPERBAND) ELSE Previous FINALUPPERBAND)
        FINAL LOWERBAND = IF( (Current BASIC LOWERBAND > Previous FINAL LOWERBAND) or (Previous Close < Previous FINAL LOWERBAND))
                            THEN (Current BASIC LOWERBAND) ELSE Previous FINAL LOWERBAND)
        SUPERTREND = IF((Previous SUPERTREND = Previous FINAL UPPERBAND) and (Current Close <= Current FINAL UPPERBAND)) THEN
                        Current FINAL UPPERBAND
                    ELSE
                        IF((Previous SUPERTREND = Previous FINAL UPPERBAND) and (Current Close > Current FINAL UPPERBAND)) THEN
                            Current FINAL LOWERBAND
                        ELSE
                            IF((Previous SUPERTREND = Previous FINAL LOWERBAND) and (Current Close >= Current FINAL LOWERBAND)) THEN
                                Current FINAL LOWERBAND
                            ELSE
                                IF((Previous SUPERTREND = Previous FINAL LOWERBAND) and (Current Close < Current FINAL LOWERBAND)) THEN
                                    Current FINAL UPPERBAND
*/

export default class Ema implements ChartItem {
  #scaledX: Scales['x'];

  #scaledY: Scales['y'];

  #downTrendLines?: D3Selection<SVGGElement>;

  #upTrendLines?: D3Selection<SVGGElement>;

  #period = 10;

  #multiplier = 3;

  #upColor = 'red';

  #downColor = 'green';

  #candles: DrawData['candles'] = [];

  constructor({ scales }: { scales: Scales }) {
    this.#scaledX = scales.x;
    this.#scaledY = scales.y;
  }

  public appendTo = (parent: Element): void => {
    const container = d3.select(parent).append('g').attr('clip-path', 'url(#clipChart)');

    this.#downTrendLines = container.append('g');
    this.#upTrendLines = container.append('g');
  };

  public draw({ candles }: { candles: api.FuturesChartCandle[] }): void {
    const curve = d3.line().curve(d3.curveLinear);

    this.#candles = candles;

    const { upper, lower } = this.#calcSupertrend(candles);

    this.#downTrendLines
      ?.selectAll('path')
      .data(upper)
      .join(
        (enter) => enter
          .append('path')
          .attr('d', (d) => curve(d))
          .attr('fill', 'none')
          .attr('stroke', this.#downColor),
        (update) => update
          .attr('d', (d) => curve(d))
          .attr('stroke', this.#downColor),
        (exit) => exit.remove(),
      );

    this.#upTrendLines
      ?.selectAll('path')
      .data(lower)
      .join(
        (enter) => enter
          .append('path')
          .attr('d', (d) => curve(d))
          .attr('fill', 'none')
          .attr('stroke', this.#upColor),
        (update) => update
          .attr('d', (d) => curve(d))
          .attr('stroke', this.#upColor),
        (exit) => exit.remove(),
      );
  }

  public resize = (): void => {
    // none
  };

  public update = (data: {
    scaledX?: d3.ScaleTime<number, number>;

    shouldShowSupertrend?: boolean;
    supertrendPeroid?: number;
    supertrendMultiplier?: number;
    supertrendDownTrendColor?: string;
    supertrendUpTrendColor?: string;
  }): void => {
    if (typeof data.scaledX !== 'undefined') this.#scaledX = data.scaledX;

    if (typeof data.shouldShowSupertrend !== 'undefined') {
      this.#downTrendLines?.style('display', data.shouldShowSupertrend ? '' : 'none');
      this.#upTrendLines?.style('display', data.shouldShowSupertrend ? '' : 'none');
    }

    if (typeof data.supertrendPeroid !== 'undefined') this.#period = data.supertrendPeroid;
    if (typeof data.supertrendMultiplier !== 'undefined') this.#multiplier = data.supertrendMultiplier;
    if (typeof data.supertrendDownTrendColor !== 'undefined') this.#downColor = data.supertrendDownTrendColor;
    if (typeof data.supertrendUpTrendColor !== 'undefined') this.#upColor = data.supertrendUpTrendColor;

    if (
      typeof data.supertrendPeroid !== 'undefined'
      || typeof data.supertrendMultiplier !== 'undefined'
      || typeof data.supertrendDownTrendColor !== 'undefined'
      || typeof data.supertrendUpTrendColor !== 'undefined') {
      this.draw({ candles: this.#candles });
    }
  };

  #calcSupertrend = (
    candles: api.FuturesChartCandle[],
  ): { upper: [number, number][][], lower: [number, number][][] } => {
    let FINAL_UPPERBAND = 0;
    let FINAL_LOWERBAND = 0;
    let SUPERTREND = 0;
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

      const PREV_FINAL_UPPERBAND = FINAL_UPPERBAND;
      const PREV_FINAL_LOWERBAND = FINAL_LOWERBAND;

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

      let isUpper;

      // https://github.com/jigneshpylab/ZerodhaPythonScripts/blob/master/supertrend.py#L133-L155
      if (!SUPERTREND || SUPERTREND === PREV_FINAL_UPPERBAND) {
        SUPERTREND = candle.close <= FINAL_UPPERBAND ? FINAL_UPPERBAND : FINAL_LOWERBAND;
        isUpper = candle.close <= FINAL_UPPERBAND;
      } else if (SUPERTREND === PREV_FINAL_LOWERBAND) {
        SUPERTREND = candle.close >= FINAL_LOWERBAND ? FINAL_LOWERBAND : FINAL_UPPERBAND;
        isUpper = candle.close < FINAL_LOWERBAND;
      }

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
