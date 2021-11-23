import * as api from '../../api';
import { orderFilledSoundUri } from '../../lib/alertSounds';
import getOrderInfo from './getOrderInfo';

export default function eventOrderUpdate(
  this: Store['trading'],
  o: api.UserDataEventOrderUpdateData,
  updateTime: number,
): void {
  // create API-like order object
  // https://binance-docs.github.io/apidocs/futures/en/#event-order-update
  /*
  {
    "s":"BTCUSDT",              // Symbol
    "c":"TEST",                 // Client Order Id
      // special client order id:
      // starts with "autoclose-": liquidation order
      // "adl_autoclose": ADL auto close order
    "S":"SELL",                 // Side
    "o":"TRAILING_STOP_MARKET", // Order Type
    "f":"GTC",                  // Time in Force
    "q":"0.001",                // Original Quantity
    "p":"0",                    // Original Price
    "ap":"0",                   // Average Price
    "sp":"7103.04",             // Stop Price. Please ignore with TRAILING_STOP_MARKET order
    "x":"NEW",                  // Execution Type
    "X":"NEW",                  // Order Status
    "i":8886774,                // Order Id
    "l":"0",                    // Order Last Filled Quantity
    "z":"0",                    // Order Filled Accumulated Quantity
    "L":"0",                    // Last Filled Price
    "N":"USDT",             // Commission Asset, will not push if no commission
    "n":"0",                // Commission, will not push if no commission
    "T":1568879465651,          // Order Trade Time
    "t":0,                      // Trade Id
    "b":"0",                    // Bids Notional
    "a":"9.91",                 // Ask Notional
    "m":false,                  // Is this trade the maker side?
    "R":false,                  // Is this reduce only
    "wt":"CONTRACT_PRICE",      // Stop Price Working Type
    "ot":"TRAILING_STOP_MARKET",    // Original Order Type
    "ps":"LONG",                        // Position Side
    "cp":false,                     // If Close-All, pushed with conditional order
    "AP":"7476.89",             // Activation Price, only puhed with TRAILING_STOP_MARKET order
    "cr":"5.0",                 // Callback Rate, only puhed with TRAILING_STOP_MARKET order
    "rp":"0"                            // Realized Profit of the trade
  }
  */

  const order: api.FuturesOrder = {
    clientOrderId: o.c,
    cumQuote: '0', // TODO what stream field should be used?
    executedQty: o.z,
    orderId: o.i,
    avgPrice: o.ap,
    origQty: o.q,
    price: o.p,
    reduceOnly: o.R,
    side: o.S,
    positionSide: o.ps,
    status: o.X,
    stopPrice: o.sp,
    closePosition: o.cp,
    symbol: o.s,
    timeInForce: o.f,
    type: o.o,
    origType: o.o,
    activatePrice: o.AP,
    updateTime,
    workingType: o.wt,
    priceProtect: false, // TODO what stream field should be used?
  };

  // eslint-disable-next-line no-console
  console.info(`Received order with status ${order.status}. orderId = ${order.orderId}; executedQty = ${order.executedQty}`);

  if (order.status === 'PARTIALLY_FILLED') {
    this.openOrders = this.openOrders.map((openOrder) => {
      if (openOrder.orderId === order.orderId) {
        return { ...openOrder, ...getOrderInfo.call(this, order, openOrder) };
      }
      return openOrder;
    });
  }

  // TODO support stop orders
  if (order.type === 'LIMIT') {
    if (order.status === 'NEW') {
      // if the order is created from draft, hide draft line
      // the ID is set by DraftPriceLines (part of the chart class) when draft check icon is clicked
      if (order.clientOrderId.startsWith('from_draft_')) {
        this.shouldShowLimitSellPriceLine = false;
      }
      this.openOrders = [...this.openOrders, getOrderInfo.call(this, order)];
    }

    if (['CANCELED', 'EXPIRED', 'FILLED'].includes(order.status)) {
      this.openOrders = this.openOrders.filter((openOrder) => openOrder.orderId !== order.orderId);
    }
  }

  if (order.status === 'FILLED') void new Audio(orderFilledSoundUri).play();
}
