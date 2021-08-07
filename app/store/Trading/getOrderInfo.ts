import { TradingOrder } from '../types';
import * as api from '../../api';

export default function getOrderInfo(order: api.FuturesOrder, lastPrice: number): TradingOrder {
  return {
    lastPrice,
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
  };
}
