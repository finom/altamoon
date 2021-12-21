export { setOptions } from './options';
export { default as futuresSubscribe } from './futuresSubscribe';
export { default as futuresChartSingleSubscription } from './futuresChartSingleSubscription';
export { default as promiseRequest } from './promiseRequest';
export * from './futuresREST';
export * from './futuresStreams';
export * from './spot';
export * from './types';
/*
import Worker from "./work.worker";

const worker = new Worker();

worker.postMessage({ a: 1 });

worker.addEventListener("message", function (event) { console.log(event.data) });
*/
