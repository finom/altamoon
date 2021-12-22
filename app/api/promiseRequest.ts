import qs from 'qs';
import { HmacSHA256 } from 'crypto-js';

import options from './options';
import emitError from './emitError';
import futuresSubscribe from './futuresSubscribe';

interface Flags {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  type?: 'TRADE' | 'SIGNED' | 'MARKET_DATA' | 'USER_DATA' | 'USER_STREAM';
  baseURL?: string;
}

interface Data {
  recvWindow?: number;
  timestamp?: number;
  signature?: string;
  [key: string]: number | string | boolean | undefined;
}

interface ErrorResponse {
  code: number;
  msg: string;
}

let timeDiffPromise: Promise<number>;

// create promise that waits for the first aggTrade and closes connection immediately
const getTimeDiffPromise: () => Promise<number> = () => {
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  const promise = timeDiffPromise || new Promise((resolve) => {
    const close = futuresSubscribe(['btcusdt@aggTrade'], (ticker: { E: number }) => {
      resolve(Date.now() - ticker.E);
      close();
    });
  });

  timeDiffPromise = promise;

  return promise;
};

export default async function promiseRequest<T>(
  url: string, givenData: Data = {}, flags: Flags = {},
): Promise<T> {
  let query = '';
  const data = { ...givenData };
  const headers: { 'Content-type': string; 'X-MBX-APIKEY'?: string } = {
    'Content-type': 'application/x-www-form-urlencoded',
  };

  const {
    method = 'GET',
    type,
    baseURL = options.apiURL,
  } = flags;
  if (type) {
    if (typeof data.recvWindow === 'undefined') data.recvWindow = options.recvWindow;

    if (!options.apiKey) throw new Error('Invalid API credentials!');
    headers['X-MBX-APIKEY'] = options.apiKey;
  }

  let resource: string;
  if (type === 'SIGNED' || type === 'TRADE' || type === 'USER_DATA') {
    if (!options.apiSecret) throw new Error('Invalid API credentials!');
    data.timestamp = Date.now() - await getTimeDiffPromise();
    query = qs.stringify(data);
    const signature = HmacSHA256(query, options.apiSecret);
    resource = `${baseURL}${url}?${query}&signature=${signature.toString()}`;
  } else {
    query = qs.stringify(data);
    resource = `${baseURL}${url}?${query}`;
  }

  try {
    const responseText = await (await fetch(resource, {
      headers,
      method,
      mode: 'cors',
    })).text();

    const response = JSON.parse(responseText) as T | ErrorResponse;

    if (!!response && 'code' in response && 'msg' in response && response.msg !== 'success' && response.code !== 200) {
      throw new Error(response.msg);
    }

    return response as T;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    emitError(e as Error);
    throw e;
  }
}
