import * as api from '../../api';
import notify from '../../lib/notify';

export default async function cancelOrder(
  this: Store['trading'], symbol: string, orderId: number,
): Promise<api.FuturesOrder | null> {
  this.openOrders = this.openOrders.map((order) => {
    if (order.orderId === orderId) {
      this.canceledOrderIds.push(orderId);
      return {
        ...order,
        isCanceled: true,
      };
    }
    return order;
  });

  try {
    const result = await api.futuresCancel(symbol, orderId);

    notify('success', `Order for ${symbol} is canceled`);

    return result;
  } catch {
    this.openOrders = this.openOrders.map((order) => {
      if (order.orderId === orderId) {
        this.canceledOrderIds = this.canceledOrderIds.filter((id) => id !== order.orderId);
        return {
          ...order,
          isCanceled: false,
        };
      }
      return order;
    });

    return null;
  }
}
