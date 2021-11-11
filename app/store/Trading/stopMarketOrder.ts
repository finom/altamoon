import * as api from '../../api';
import notify from '../../lib/notify';

export default async function stopMarketOrder(this: Store['trading'], {
  side, quantity, symbol, stopPrice, reduceOnly = false,
}: {
  side: api.OrderSide;
  quantity: number;
  symbol: string;
  stopPrice: number;
  reduceOnly?: boolean;
}): Promise<api.FuturesOrder | null> {
  try {
    const result = await api.futuresStopMarketOrder(
      side, symbol, quantity, stopPrice, { reduceOnly },
    );

    notify('success', `Stop market order for ${symbol} is created`);

    return result;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    return null;
  }
}
