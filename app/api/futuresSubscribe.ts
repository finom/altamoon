import RobustWebSocket from 'altamoon-robust-websocket';
import emitError from './emitError';
import options from './options';

/**
 * Creates subscription using Binance Futures API
 * @param streams - List of subscriptions
 * @param callback - Callback
 */
export default function futuresSubscribe<T = unknown>(
  streams: string[], callback: (ticker: T, stream: string) => void,
): () => void {
  const streamsStr = streams.join('/');
  const url = `${options.wsURL}?streams=${streamsStr}`;
  let webSocket = new RobustWebSocket(url);

  let isClosed = false;

  const addEvents = (ws: RobustWebSocket) => {
    ws.addEventListener('error', (event) => {
      if (!isClosed) {
        // eslint-disable-next-line no-console
        console.error('Stream error', event, ws.readyState);
        emitError(`Stream error ${streamsStr}`);
      }
    });

    ws.addEventListener('message', (event: MessageEvent<string>) => {
      let tick: { data: T; stream: string; } | null = null;

      try {
        tick = JSON.parse(event.data) as { data: T; stream: string; };
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Unable to parse stream data', e);
        emitError(e as Error);
      }

      if (tick) {
        try {
          callback(tick.data, tick.stream);
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('Unable to call stream callback', e);
        }
      }
    });

    ws.addEventListener('close', () => {
      if (!isClosed) {
        webSocket = new WebSocket(url);
        addEvents(webSocket);
      }
    });
  };

  addEvents(webSocket);

  return () => {
    isClosed = true;
    webSocket.close();
  };
}
