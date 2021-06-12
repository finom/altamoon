/* eslint-disable no-param-reassign */
import qs from 'qs';
import crypto from 'crypto';
import notify from '../lib/notify';
import options from './options';

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

export default async function promiseRequest<T>(
  url: string, data: Data = {}, flags: Flags = {},
): Promise<T> {
  let query = '';
  const headers: { 'Content-type': string; 'X-MBX-APIKEY'?: string } = {
    'Content-type': 'application/x-www-form-urlencoded',
  };

  const { method = 'GET', type, baseURL = 'https://fapi.binance.com/fapi/' } = flags;
  if (type) {
    if (typeof data.recvWindow === 'undefined') data.recvWindow = options.recvWindow;
    if (!options.apiKey) throw new Error('Invalid API credentials!');
    headers['X-MBX-APIKEY'] = options.apiKey;
  }

  let resource: string;
  if (type === 'SIGNED' || type === 'TRADE' || type === 'USER_DATA') {
    if (!options.apiSecret) throw new Error('Invalid API credentials!');
    data.timestamp = new Date().getTime();
    query = qs.stringify(data);
    const signature = crypto.createHmac('sha256', options.apiSecret).update(query).digest('hex'); // HMAC hash header
    resource = `${baseURL}${url}?${query}&signature=${signature}`;
  } else {
    query = qs.stringify(data);
    resource = `${baseURL}${url}?${query}`;
  }

  try {
    const responseText = await (await fetch(resource, {
      headers,
      method,
    })).text();

    const response = JSON.parse(responseText) as T | ErrorResponse;

    if (!!response && 'code' in response && 'msg' in response && response.msg !== 'success') {
      throw new Error(response.msg);
    }

    return response as T;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    notify('error', e);
    throw e;
  }
}
