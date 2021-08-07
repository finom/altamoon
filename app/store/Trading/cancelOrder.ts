import * as api from '../../api';
import notify from '../../lib/notify';

export default async function cancelOrder(
  this: Store['trading'], symbol: string, orderId: number,
): Promise<api.FuturesOrder | null> {
  try {
    const result = await api.futuresCancel(symbol, orderId);

    await this.loadOrders();

    notify('success', `Order for ${symbol} is canceled`);

    return result;
  } catch {
    return null;
  }
}
