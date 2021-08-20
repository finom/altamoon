import { TradingOrder } from '../types';
import * as api from '../../api';

export default function getOrderInfo(
  this: Store['trading'],
  order: api.FuturesOrder,
  override: {
    lastPrice: number, leverage: number, marginType: api.FuturesPositionRisk['marginType'],
  },
): TradingOrder {
  const value = +order.price * (+order.origQty - +order.executedQty);
  const leverageBracket = this.store.account.leverageBrackets[order.symbol]?.find(
    ({ notionalCap }) => notionalCap > value,
  ) ?? null;

  return {
    lastPrice: override.lastPrice,
    clientOrderId: order.clientOrderId,
    cumQuote: order.cumQuote,
    executedQty: +order.executedQty,
    orderId: order.orderId,
    avgPrice: +order.avgPrice,
    origQty: +order.origQty,
    price: +order.price,
    reduceOnly: order.reduceOnly,
    side: order.side,
    positionSide: order.positionSide,
    status: order.status,
    stopPrice: +order.stopPrice,
    closePosition: order.closePosition,
    symbol: order.symbol,
    timeInForce: order.timeInForce,
    type: order.type,
    origType: order.origType,
    updateTime: order.updateTime,
    workingType: order.workingType,
    priceProtect: order.priceProtect,
    leverageBracket,
    marginType: override.marginType,
    leverage: override.leverage,
  };
}
