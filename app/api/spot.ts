import promiseRequest from './promiseRequest';

type Result = Record<string, { available: number; locked: number }>;
const api = 'https://api.binance.com/api/';
const sapi = 'https://api.binance.com/sapi/';
export async function balance(): Promise<Result> {
  const { balances } = await promiseRequest<{ balances: { asset: string; free: string; locked: string }[] }>('v3/account', {}, {
    type: 'SIGNED', baseURL: api,
  });

  const result: Result = {};

  for (const { locked, free, asset } of balances) {
    result[asset] = { locked: +locked, available: +free };
  }

  return result;
}

interface TransferOptions {
  asset: string;
  amount: number;
  isFromSpotToFutures: boolean;
}

export async function transfer({
  asset, amount, isFromSpotToFutures,
}: TransferOptions): Promise<{ tranId: number; }> {
  return promiseRequest(
    'v1/futures/transfer',
    { asset, amount, type: isFromSpotToFutures ? 1 : 2 },
    { method: 'POST', type: 'SIGNED', baseURL: sapi },
  );
}
