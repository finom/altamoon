import * as api from '../../api';
import notify from '../../lib/notify';

export default async function marketOrder(this: Store['trading'], {
  side, quantity, symbol, reduceOnly = false,
}: {
  side: api.OrderSide; quantity: number; symbol: string; reduceOnly?: boolean;
}): Promise<api.FuturesOrder | null> {
  try {
    const result = await api.futuresMarketOrder(
      side, symbol, quantity, { reduceOnly },
    );

    await this.loadPositions();

    notify('success', `Position for ${symbol} is created`);

    return result;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    return null;
  }
}
