import { TradingOrder } from '../types';
import * as api from '../../api';

export default function getOrderInfo(
  this: Store['trading'],
  order: api.FuturesOrder,
  override: {
    lastPrice?: number, leverage?: number, marginType?: api.FuturesPositionRisk['marginType'],
  } = {},
): TradingOrder {
  const lastPrice = override.lastPrice
    ?? +this.store.market.allSymbolsTickers[order.symbol]?.close ?? 0;
  const leverage = override.leverage ?? +this.allSymbolsPositionRisk[order.symbol]?.leverage ?? 1;
  const marginType = override.marginType ?? this.allSymbolsPositionRisk[order.symbol]?.marginType ?? 'cross';
  const value = +order.price * (+order.origQty - +order.executedQty);
  const leverageBracket = this.store.account.leverageBrackets[order.symbol]?.find(
    ({ notionalCap }) => notionalCap > value,
  ) ?? null;

  return {
    leverageBracket,
    lastPrice,
    marginType,
    leverage,
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
    isCanceled: this.openOrders.some((o) => order.orderId === o.orderId && o.isCanceled),
  };
}
