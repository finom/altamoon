import * as api from '../../api';
import notify from '../../lib/notify';

export default async function cancelAllOrders(this: Store['trading'], symbol: string): Promise<void> {
  try {
    await api.futuresCancelAll(symbol);

    await this.loadOrders();

    notify('success', `All orders for ${symbol} are canceled`);
  } catch {} // caught by called methods
}
