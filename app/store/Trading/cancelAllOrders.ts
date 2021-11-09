import * as api from '../../api';
import notify from '../../lib/notify';

export default async function cancelAllOrders(this: Store['trading'], symbol: string): Promise<void> {
  try {
    this.openOrders = this.openOrders.map((order) => (order.symbol === symbol ? {
      ...order,
      isCanceled: true,
    } : order));

    await api.futuresCancelAll(symbol);

    notify('success', `All orders for ${symbol} are canceled`);
  } catch {} // caught by called methods
}
