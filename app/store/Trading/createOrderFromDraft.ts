import * as api from '../../api';
import notify from '../../lib/notify';

// used by Chart Widget compoment
export default async function createOrderFromDraft(this: altamoon.RootStore['trading'], {
  buyDraftPrice, sellDraftPrice, stopBuyDraftPrice, stopSellDraftPrice, newClientOrderId,
}: {
  buyDraftPrice: number | null;
  sellDraftPrice: number | null;
  stopBuyDraftPrice: number | null;
  stopSellDraftPrice: number | null;
  newClientOrderId: string;
}, side: api.OrderSide): Promise<void> {
  const {
    tradingType, symbol, tradingBuyReduceOnly, tradingSellReduceOnly, tradingPostOnly: postOnly,
    tradingIsPercentModeBuy, tradingIsPercentModeSell,
  } = this.store.persistent;
  const reduceOnly = side === 'BUY' ? tradingBuyReduceOnly : tradingSellReduceOnly;
  const isPercentMode = side === 'BUY' ? tradingIsPercentModeBuy : tradingIsPercentModeSell;
  const price = side === 'BUY' ? buyDraftPrice : sellDraftPrice;
  const stopPrice = side === 'BUY' ? stopBuyDraftPrice : stopSellDraftPrice;
  const exactSizeStr = side === 'BUY'
    ? this.store.persistent.tradingExactSizeBuyStr
    : this.store.persistent.tradingExactSizeSellStr;

  if (typeof price !== 'number') throw new Error('Price is not a number');

  if (tradingType === 'STOP' || tradingType === 'STOP_MARKET') {
    if (!stopPrice) {
      notify('error', 'Stop price is not given');

      return;
    }
    const size = this.calculateSizeFromString(symbol, exactSizeStr, { isPercentMode });

    const quantity = this.calculateQuantity({
      symbol,
      price,
      size,
    });

    if (!quantity) {
      notify('error', 'Order size is zero or not given');

      return;
    }

    await this.stopLimitOrder({
      side,
      quantity,
      price,
      stopPrice,
      symbol,
      reduceOnly,
      postOnly,
      newClientOrderId,
    });
  } else { // LIMIT or MARKET
    const size = this.calculateSizeFromString(symbol, exactSizeStr, { isPercentMode });

    const quantity = this.calculateQuantity({
      symbol,
      price,
      size,
    });

    if (!quantity) {
      notify('error', 'Order size is zero or not given');

      return;
    }

    await this.limitOrder({
      side,
      quantity,
      price,
      symbol,
      reduceOnly,
      postOnly,
      newClientOrderId,
    });
  }
}
