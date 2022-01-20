import { FuturesChartCandle, CandlestickChartInterval, ExtendedCandlestickChartInterval } from './types';
import intervalStrToMs from './intervalStrToMs';

const intervalMap: Record<
ExtendedCandlestickChartInterval, CandlestickChartInterval | ExtendedCandlestickChartInterval
> = {
  '2m': '1m', '10m': '5m', '2d': '1d', '4d': '2d', '2w': '1w', '2M': '1M',
};

export default function combineCandlesIfNeeded(
  interval: CandlestickChartInterval | ExtendedCandlestickChartInterval,
  candles: FuturesChartCandle[],
): FuturesChartCandle[] {
  const validInterval: CandlestickChartInterval | null = intervalMap[
    intervalMap[interval as ExtendedCandlestickChartInterval] as ExtendedCandlestickChartInterval
  ] as CandlestickChartInterval
  ?? intervalMap[interval as ExtendedCandlestickChartInterval] as CandlestickChartInterval
  ?? null;

  if (!validInterval) return candles;
  let isEven: boolean;

  if (validInterval === '1M') {
    const d = new Date();
    isEven = !!((d.getFullYear() * 18 + d.getMonth()) % 2);
  } else {
    isEven = !!(Math.floor(Date.now() / intervalStrToMs(validInterval)) % 2);
  }

  const newCandles: FuturesChartCandle[] = [];

  if (isEven) {
    newCandles.push(candles[candles.length - 1]);
  }

  for (let i = isEven ? candles.length - 2 : candles.length - 1; i >= 0; i -= 2) {
    const oneCandle = candles[i];
    const anotherCandle = candles[i - 1];
    const open = anotherCandle?.open ?? oneCandle.open;
    const { close } = oneCandle;

    const newCandle: FuturesChartCandle = {
      volume: oneCandle.volume + (anotherCandle?.volume ?? 0),
      close,
      open,
      high: Math.max(anotherCandle?.high ?? 0, oneCandle.high),
      low: Math.min(oneCandle.low, anotherCandle?.low ?? Infinity),
      trades: oneCandle.trades + (anotherCandle?.trades ?? 0),
      quoteVolume: oneCandle.quoteVolume + (anotherCandle?.quoteVolume ?? 0),
      takerBuyBaseVolume: oneCandle.takerBuyBaseVolume + (anotherCandle?.takerBuyBaseVolume ?? 0),
      takerBuyQuoteVolume: oneCandle.takerBuyQuoteVolume
        + (anotherCandle?.takerBuyQuoteVolume ?? 0),
      time: anotherCandle?.time ?? oneCandle.time,
      closeTime: oneCandle.closeTime,
      timeISOString: anotherCandle?.timeISOString ?? oneCandle.timeISOString,
      closeTimeISOString: oneCandle.closeTimeISOString,
      symbol: oneCandle.symbol,
      interval,
      direction: open > close ? 'UP' : 'DOWN',
    };

    newCandles.unshift(newCandle);
  }

  if (interval === '4d') {
    return combineCandlesIfNeeded('2d', newCandles);
  }

  return newCandles;
}
