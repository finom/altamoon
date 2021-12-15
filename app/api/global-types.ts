/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable no-var, vars-on-top */
// eslint-disable-next-line @typescript-eslint/no-namespace
import { CandlestickChartInterval, FuturesChartCandle } from './types';

declare global {
  namespace globalThis {
    var singleSubscriptionCallbacks: Record<CandlestickChartInterval, {
      symbol: string | null; callback: (symbol: string, candles: FuturesChartCandle[]) => void;
    }[]>;
    var singleSubscriptionTo: Record<CandlestickChartInterval, boolean>;
    var singleSubscriptionAllCandles: Record<
    CandlestickChartInterval, Record<string, FuturesChartCandle[]>
    >;
  }
}
