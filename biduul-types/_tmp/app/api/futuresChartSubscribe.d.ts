import { FuturesChartCandle, CandlestickChartInterval } from './types';
export default function futuresChartSubscribe(symbol: string, interval: CandlestickChartInterval, callback: (futuresKlineConcat: FuturesChartCandle[]) => void, limit?: number): () => void;
//# sourceMappingURL=futuresChartSubscribe.d.ts.map