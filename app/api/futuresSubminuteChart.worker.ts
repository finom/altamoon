import {
  // CandlestickChartInterval, FuturesChartCandle, WorkerCandlesMessageBack,
  WorkerSubscribeMessage, WorkerUnsubscribeMessage, WorkerInitMessage,
} from './types';

// eslint-disable-next-line no-restricted-globals
const ctx = self as unknown as Worker;

// eslint-disable-next-line @typescript-eslint/no-misused-promises
ctx.addEventListener('message', ({ data }: MessageEvent<WorkerSubscribeMessage | WorkerInitMessage | WorkerUnsubscribeMessage>) => {
  // eslint-disable-next-line no-console
  console.log('data', data);
});

// export this pseudo class for typescript
export default class Work extends Worker { constructor() { super(''); } }
