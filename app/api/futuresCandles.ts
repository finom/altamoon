import localForage from 'localforage';
import promiseRequest from './promiseRequest';

import { FuturesChartCandle, CandlestickChartInterval } from './types';

const intervalStrToMs = (interval: Exclude<CandlestickChartInterval, '1M'>) => {
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
};

// the test can be moved to a separate script later
function runtimeTestCandlesOrder(
  interval: CandlestickChartInterval, candles: FuturesChartCandle[],
) {
  if (process.env.NODE_ENV === 'development') {
    if (!candles.length) return;

    void import('expect.js').then(({ default: expect }) => {
      let prevTime = candles[candles.length - 1].time;

      if (interval !== '1M') {
        const intervalMs = intervalStrToMs(interval);

        for (let i = candles.length - 2; i >= 0; i -= 1) {
          const { time } = candles[i];
          expect(new Date(time).toISOString()).to.be(new Date(prevTime - intervalMs).toISOString());
          prevTime = time;
        }
      } else {
        const date = new Date(prevTime);

        for (let i = candles.length - 2; i >= 0; i -= 1) {
          const { time } = candles[i];
          // set hours to ignore yearly time shifts
          date.setMonth(date.getMonth() - 1);
          date.setHours(0);

          const candleDate = new Date(time);
          candleDate.setHours(0);
          expect(candleDate.toISOString()).to.be(date.toISOString());
        }
      }
    }).catch((e) => {
      // eslint-disable-next-line no-console
      console.log('candles', candles[0]?.symbol, candles[0]?.interval, candles.map((c) => c.timeISOString));
      throw e;
    });
  }
}

export default async function futuresCandles({
  symbol, interval, limit, lastCandleFromCache,
}: {
  symbol: string; interval: CandlestickChartInterval; limit: number; lastCandleFromCache?: boolean;
}): Promise<FuturesChartCandle[]> {
  const storageKey = `${symbol}_${interval}`;
  let startDate: number | undefined;
  let calculatedLimit = limit;
  let cachedCandles: FuturesChartCandle[] = [];

  await localForage.removeItem(storageKey);

  try {
    const storedValue: string | null = await localForage.getItem(storageKey);
    cachedCandles = JSON.parse(storedValue ?? '[]') as FuturesChartCandle[];
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
  }

  const lastCachedCandleOpenTime = cachedCandles.length
    ? cachedCandles[cachedCandles.length - 1].time
    : 0;
  const lastCachedCandleCloseTime = cachedCandles.length
    ? cachedCandles[cachedCandles.length - 1].closeTime
    : 0;
  const firstCachedCandleOpenTime = cachedCandles.length ? cachedCandles[0].time : Infinity;
  const isFirstCachedCandleFirstEver = cachedCandles[0]?.isFirstEver ?? false;

  if (interval !== '1M') {
    const expectedCandlesStartDate = Date.now() - intervalStrToMs(interval) * (limit - 1);

    // if last cached candle time overlaps reqested candle time (May 1 ... May 5, May 3 ... May 7)
    if (
      lastCachedCandleCloseTime >= expectedCandlesStartDate
      && (firstCachedCandleOpenTime <= expectedCandlesStartDate || isFirstCachedCandleFirstEver)
    ) {
      startDate = lastCachedCandleCloseTime;
      calculatedLimit = Math[lastCandleFromCache ? 'floor' : 'ceil'](
        (Date.now() - lastCachedCandleOpenTime) / intervalStrToMs(interval),
      );

      if (!lastCandleFromCache) cachedCandles.pop();
    }
  } else { // 1M calculated differently since 1 month cannot be converted into exact amount of ms
    const expectedStartDate = new Date();
    expectedStartDate.setHours(0, 0, 0);
    expectedStartDate.setTime(
      expectedStartDate.getTime() - expectedStartDate.getTimezoneOffset() * 60 * 1000,
    );
    expectedStartDate.setMonth(expectedStartDate.getMonth() - limit + 1);
    expectedStartDate.setMilliseconds(0);
    expectedStartDate.setDate(1);
    const expectedCandlesStartDate = expectedStartDate.getTime();

    if (
      lastCachedCandleCloseTime >= expectedCandlesStartDate
      && (firstCachedCandleOpenTime <= expectedCandlesStartDate || isFirstCachedCandleFirstEver)
    ) {
      const currentDate = new Date();
      const lastCandleDate = new Date(lastCachedCandleOpenTime);
      startDate = lastCachedCandleCloseTime;
      calculatedLimit = currentDate.getMonth() - lastCandleDate.getMonth()
        + (12 * (currentDate.getFullYear() - lastCandleDate.getFullYear()))
        + (lastCandleFromCache ? 0 : 1);

      if (!lastCandleFromCache) cachedCandles.pop();
    }
  }

  const klines = calculatedLimit === 0 ? [] : await promiseRequest<(string | number)[][]>('v1/klines', {
    symbol, interval, limit: calculatedLimit, startDate,
  });

  const requestedCandles = klines.map(([
    time, open, high, low, close, volume, closeTime, quoteVolume,
    trades, takerBuyBaseVolume, takerBuyQuoteVolume,
  ]) => {
    const candle: FuturesChartCandle = {
      symbol,
      interval,
      time: time as number,
      closeTime: closeTime as number,
      open: +open,
      high: +high,
      low: +low,
      close: +close,
      volume: +volume,
      quoteVolume: +quoteVolume,
      takerBuyBaseVolume: +takerBuyBaseVolume,
      takerBuyQuoteVolume: +takerBuyQuoteVolume,
      trades: trades as number,
      direction: +open <= +close ? 'UP' : 'DOWN',
      closeTimeISOString: new Date(closeTime as number).toISOString(),
      timeISOString: new Date(time as number).toISOString(),
    };

    return candle;
  });

  if (requestedCandles.length && requestedCandles.length < calculatedLimit) {
    requestedCandles[0].isFirstEver = true;
  }

  const candles = startDate
    ? [
      ...cachedCandles.filter(({ isFinal }) => isFinal !== false || requestedCandles.length === 0),
      ...requestedCandles,
    ]
    : requestedCandles;

  try {
    await localForage.setItem(
      storageKey, JSON.stringify(candles),
    );
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
  }

  runtimeTestCandlesOrder(interval, candles);

  return candles;
}

(window as unknown as { clearCandles: () => void }).clearCandles = () => localForage.clear();
