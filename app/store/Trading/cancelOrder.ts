import * as api from '../../api';
import notify from '../../lib/notify';

export default async function cancelOrder(
  this: Store['trading'], symbol: string, orderId: number,
): Promise<api.FuturesOrder | null> {
  try {
    this.openOrders = this.openOrders.map((order) => (order.orderId === orderId ? {
      ...order,
      isCanceled: true,
    } : order));

    const result = await api.futuresCancel(symbol, orderId);

    notify('success', `Order for ${symbol} is canceled`);

    return result;
  } catch {
    return null;
  }
}
