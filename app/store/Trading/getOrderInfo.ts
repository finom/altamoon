import { TradingOrder } from '../types';
import * as api from '../../api';

export default function getOrderInfo(
  this: Store['trading'], order: api.FuturesOrder, lastPrice: number,
): TradingOrder {
  const value = +order.price * (+order.origQty - +order.executedQty);
  const leverageBracket = this.store.account.leverageBrackets[order.symbol]?.find(
    ({ notionalCap }) => notionalCap > value,
  ) ?? null;

  const positionRisk = this.allSymbolsPositionRisk[order.symbol];

  const marginType = positionRisk?.marginType || 'isolated';
  const leverage = +positionRisk?.leverage || 1;

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
    leverageBracket,
    marginType,
    leverage,
  };
}
