/*
  See https://binance-docs.github.io/apidocs/futures/en/#diff-book-depth-streams

  How to manage a local order book correctly
  1. Open a stream to wss://fstream.binance.com/stream?streams=btcusdt@depth.
  2. Buffer the events you receive from the stream. For same price,
  latest received update covers the previous one.
  3. Get a depth snapshot from https://fapi.binance.com/fapi/v1/depth?symbol=BTCUSDT&limit=1000.
  4. Drop any event where u is < lastUpdateId in the snapshot.
  5. The first processed event should have U <= lastUpdateId AND u >= lastUpdateId
  6. While listening to the stream, each new event's pu should be equal to the previous event's u,
  otherwise initialize the process from step 3.
  7. The data in each event is the absolute quantity for a price level.
  8. If the quantity is 0, remove the price level.
  9. Receiving an event that removes a price level that is not in your local order book can happen
  and is normal.
*/

import { FuturesDepth } from 'node-binance-api';
import binance from './binance';

interface DepthUpdateTicker {
  e: 'depthUpdate'; // Event type
  E: number; // Event time
  T: number; // Transaction time
  U: number;
  a: [string, string][]; // Bids to be updated [Price Level to be, Quantity]
  b: [string, string][]; // Asks to be updated
  pu: number;
  s: string;
  u: number;
}

export default function binanceFeatureDepthSubscribe(
  symbol: string,
  callback: (asks: [number, number][], bids: [number, number][]) => void,
): string {
  let depth: FuturesDepth;
  let lastTicker: DepthUpdateTicker;
  let isProcessing = false;
  const endpoint = `${symbol.toLowerCase()}@depth@500ms`;
  const asksMap: Record<string, number> = {};
  const bidsMap: Record<string, number> = {};

  const updateMap = (data: [string, string][], map: Record<string, number>) => {
    for (const [priceStr, quantityStr] of data) {
      const quantity = +quantityStr || 0;

      if (quantity === 0) {
        // eslint-disable-next-line no-param-reassign
        delete map[priceStr];
      } else {
        // eslint-disable-next-line no-param-reassign
        map[priceStr] = quantity;
      }
    }
  };

  const updateMaps = (asks: [string, string][], bids: [string, string][]) => {
    updateMap(asks, asksMap);
    updateMap(bids, bidsMap);

    callback(
      Object.entries(asksMap)
        .map(([price, amount]) => [+price, amount] as [number, number])
        .sort(([a], [b]) => (a > b ? 1 : -1)),
      Object.entries(bidsMap)
        .map(([price, amount]) => [+price, amount] as [number, number])
        .sort(([a], [b]) => (a > b ? -1 : 1)),
    );
  };

  // 1. Open a stream to wss://fstream.binance.com/stream?streams=btcusdt@depth.
  binance.futuresSubscribe<DepthUpdateTicker>(endpoint, (ticker) => {
    if (
      // 4. Drop any event where u is < lastUpdateId in the snapshot.
      ticker.u < depth?.lastUpdateId
      // 5. The first processed event should have U <= lastUpdateId AND u >= lastUpdateId
      || (!lastTicker && ticker.U > depth?.lastUpdateId)
      || isProcessing
    ) return;

    if (
      !depth
      // 6. While listening to the stream, each new event's pu should be eq to the prev event's u,
      // otherwise initialize the process from step 3.
      || lastTicker.u !== ticker.pu
    ) {
      isProcessing = true;

      void binance.futuresDepth(symbol).then((d) => {
        // 3. Get a depth snapshot from https://fapi.binance.com/fapi/v1/depth?symbol=BTCUSDT&limit=1000.
        depth = d;
        isProcessing = false;

        updateMaps(depth.asks, depth.bids);
      });
    }

    // 2. Buffer the events you receive from the stream.
    lastTicker = ticker;

    updateMaps(ticker.a, ticker.b);
  });

  return endpoint;
}
