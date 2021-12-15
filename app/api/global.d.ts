/* eslint-disable no-var, vars-on-top */
declare namespace globalThis {
  import { CandlestickChartInterval, FuturesChartCandle } from './types';

  var singleSubscriptionCallbacks: Record<CandlestickChartInterval, {
    symbol: string | null; callback: (symbol: string, candles: FuturesChartCandle[]) => void;
  }[]>;
  var singleSubscriptionTo: Record<CandlestickChartInterval, boolean>;
  var singleSubscriptionAllCandles: Record<
  CandlestickChartInterval, Record<string, FuturesChartCandle[]>
  >;
}
