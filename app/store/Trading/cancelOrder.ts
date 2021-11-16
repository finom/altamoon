import * as api from '../../api';
import notify from '../../lib/notify';

export default async function cancelOrder(
  this: Store['trading'], symbol: string, origClientOrderId: string,
): Promise<api.FuturesOrder | null> {
  this.openOrders = this.openOrders.map((order) => {
    if (order.clientOrderId === origClientOrderId) {
      this.canceledOrderIds.push(origClientOrderId);
      return {
        ...order,
        isCanceled: true,
      };
    }
    return order;
  });

  try {
    const result = await api.futuresCancelOrder(symbol, { origClientOrderId });

    notify('success', `Order for ${symbol} is canceled`);

    return result;
  } catch {
    this.openOrders = this.openOrders.map((order) => {
      if (order.clientOrderId === origClientOrderId) {
        this.canceledOrderIds = this.canceledOrderIds.filter((id) => id !== order.clientOrderId);
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
