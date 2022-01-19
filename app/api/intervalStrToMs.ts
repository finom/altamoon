import { CandlestickChartInterval, ExtendedCandlestickChartInterval } from './types';

export default function intervalStrToMs(interval: Exclude<CandlestickChartInterval | ExtendedCandlestickChartInterval, '1M' | '2M'>) {
  const num = +interval.replace(/(\d+)\S/, '$1');
  const sym = interval.replace(/\d+(\S)/, '$1') as 'm' | 'h' | 'd' | 'w';
  const m = 1000 * 60;
  const h = m * 60;
  const d = h * 24;
  const w = d * 7;

  return {
    m: m * num,
    h: h * num,
    d: d * num,
    w: w * num,
  }[sym];
}
