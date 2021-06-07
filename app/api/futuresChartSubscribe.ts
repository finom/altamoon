import futuresSubscribe from './futuresSubscribe';
import promiseRequest from './promiseRequest';
import { FuturesChartCandle, CandlestickChartInterval } from './types';

export default function futuresChartSubscribe(
  symbol: string,
  interval: CandlestickChartInterval,
  callback: (futuresKlineConcat: FuturesChartCandle[]) => void,
  limit?: number,
): () => void {
  let data: null | FuturesChartCandle[] = null;

  void promiseRequest<(string | number)[][]>('v1/klines', { symbol, interval, limit }).then((klines) => {
    data = klines.map(([
      time, open, high, low, close, volume, closeTime, quoteVolume,
      trades, takerBuyBaseVolume, takerBuyQuoteVolume,
    ]) => ({
      time,
      closeTime,
      open,
      high,
      low,
      close,
      volume,
      quoteVolume,
      takerBuyBaseVolume,
      takerBuyQuoteVolume,
      trades,
    } as FuturesChartCandle));

    callback(data);
  });

  const unsubscribe = futuresSubscribe<{ k: Record<string, string | number | boolean> }>(
    [`${symbol.toLowerCase()}@kline_${interval}`],
    (ticker) => {
      if (!data) return;

      const {
        o: open, h: high, l: low, c: close, v: volume,
        x: isFinal, q: quoteVolume, V: takerBuyBaseVolume, Q: takerBuyQuoteVolume,
        n: trades, t: time, T: closeTime,
      } = ticker.k;

      const candle = {
        time,
        closeTime,
        open,
        high,
        low,
        close,
        volume,
        quoteVolume,
        takerBuyBaseVolume,
        takerBuyQuoteVolume,
        trades,
        isFinal,
      } as FuturesChartCandle;

      if (candle.time === data[data.length - 1].time) {
        Object.assign(data[data.length - 1], candle);
      } else {
        data.push(candle);
      }

      callback([...data]);
    },
  );

  return unsubscribe;
}
