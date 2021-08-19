import futuresSubscribe from './futuresSubscribe';
import { futuresCandles } from './futures';
import { FuturesChartCandle, CandlestickChartInterval } from './types';

export default function futuresChartSubscribe(
  symbol: string,
  interval: CandlestickChartInterval,
  callback: (futuresKlineConcat: FuturesChartCandle[]) => void,
  limit: number,
): () => void {
  let data: null | FuturesChartCandle[] = null;

  void futuresCandles({ symbol, interval, limit }).then((candles) => {
    data = candles;
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
        isFinal: isFinal as boolean,
      };

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
