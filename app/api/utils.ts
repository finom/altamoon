/* eslint-disable import/prefer-default-export */
import { FuturesChartCandle } from './types';

export function candlesToTypedArray(candles: FuturesChartCandle[]): Float64Array {
  const FIELDS_LENGTH = 11; // 11 is number of candle fields
  const float64 = new Float64Array(FIELDS_LENGTH * candles.length);

  for (let i = 0; i < candles.length; i += 1) {
    const {
      time, open, high, low, close, volume, closeTime, quoteVolume,
      trades, takerBuyBaseVolume, takerBuyQuoteVolume,
    } = candles[i];

    float64[0 + FIELDS_LENGTH * i] = time;
    float64[1 + FIELDS_LENGTH * i] = open;
    float64[2 + FIELDS_LENGTH * i] = high;
    float64[3 + FIELDS_LENGTH * i] = low;
    float64[4 + FIELDS_LENGTH * i] = close;
    float64[5 + FIELDS_LENGTH * i] = volume;
    float64[6 + FIELDS_LENGTH * i] = closeTime;
    float64[7 + FIELDS_LENGTH * i] = quoteVolume;
    float64[8 + FIELDS_LENGTH * i] = trades;
    float64[9 + FIELDS_LENGTH * i] = takerBuyBaseVolume;
    float64[10 + FIELDS_LENGTH * i] = takerBuyQuoteVolume;
  }

  return float64;
}
