import * as api from '../../api';
import notify from '../../lib/notify';

export default async function cancelAllOrders(this: Store['trading'], symbol: string): Promise<void> {
  this.openOrders = this.openOrders.map((order) => {
    if (order.symbol === symbol) {
      this.canceledOrderIds.push(order.orderId);
      return {
        ...order,
        isCanceled: true,
      };
    }
    return order;
  });

  try {
    await api.futuresCancelAll(symbol);

    notify('success', `All orders for ${symbol} are canceled`);
  } catch {
    this.openOrders = this.openOrders.map((order) => {
      if (order.symbol === symbol) {
        this.canceledOrderIds = this.canceledOrderIds.filter((id) => id !== order.orderId);
        return {
          ...order,
          isCanceled: false,
        };
      }
      return order;
    });
  }
}
