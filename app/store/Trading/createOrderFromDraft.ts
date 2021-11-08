import * as api from '../../api';
import notify from '../../lib/notify';

// used by Chart Widget compoment
export default async function createOrderFromDraft(this: Store['trading'], {
  buyDraftPrice, sellDraftPrice, stopBuyDraftPrice, stopSellDraftPrice,
}: {
  buyDraftPrice: number | null;
  sellDraftPrice: number | null;
  stopBuyDraftPrice: number | null;
  stopSellDraftPrice: number | null;
}, side: api.OrderSide): Promise<void> {
  const {
    tradingType, symbol, tradingReduceOnly: reduceOnly, tradingPostOnly: postOnly,
  } = this.store.persistent;
  const price = side === 'BUY' ? buyDraftPrice : sellDraftPrice;
  const stopPrice = side === 'BUY' ? stopBuyDraftPrice : stopSellDraftPrice;

  if (tradingType !== 'LIMIT' && tradingType !== 'STOP') throw new Error(`Unable to create order from draft for ${tradingType} order type`);
  if (typeof price !== 'number') throw new Error('Price is not a number');

  if (tradingType === 'STOP') {
    if (!stopPrice) {
      notify('error', 'Stop price is not given');

      return;
    }

    const size = this.calculateSizeFromString(symbol, side === 'BUY' ? this.exactSizeStopLimitBuyStr : this.exactSizeStopLimitSellStr);

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
    });
  } else {
    const size = this.calculateSizeFromString(symbol, side === 'BUY' ? this.exactSizeLimitBuyStr : this.exactSizeLimitSellStr);

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
      hideDraft: true,
    });
  }
}
