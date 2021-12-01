import * as api from '../../api';
import notify from '../../lib/notify';
import floorPriceByTickSize from './floorPriceByTickSize';

export default async function limitOrder(this: Store['trading'], {
  side,
  quantity,
  price,
  symbol, reduceOnly = false,
  postOnly = false, hideDraft = false, newClientOrderId,
}: {
  side: api.OrderSide;
  quantity: number;
  price: number;
  symbol: string;
  reduceOnly?: boolean;
  postOnly?: boolean;
  hideDraft?: boolean;
  newClientOrderId?: string;
}): Promise<api.FuturesOrder | null> {
  const clientOrderId = newClientOrderId ?? `order_${new Date().toISOString()}`;

  const { shouldShowLimitBuyPriceLine, shouldShowLimitSellPriceLine } = this;

  this.ordersToBeCreated = [...this.ordersToBeCreated, {
    symbol,
    clientOrderId,
    origQty: quantity,
    price,
  }];

  if (hideDraft) {
    if (side === 'BUY') this.shouldShowLimitBuyPriceLine = false;
    else this.shouldShowLimitSellPriceLine = false;
  }

  try {
    const result = await api.futuresLimitOrder(
      side,
      symbol,
      quantity,
      floorPriceByTickSize(this.store.market.futuresExchangeSymbols[symbol], price),
      { reduceOnly, timeInForce: postOnly ? 'GTX' : 'GTC', newClientOrderId: clientOrderId },
    );

    notify('success', `Limit order for ${symbol} is created`);

    return result;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);

    if (hideDraft) {
      if (side === 'BUY') this.shouldShowLimitBuyPriceLine = shouldShowLimitBuyPriceLine;
      else this.shouldShowLimitSellPriceLine = shouldShowLimitSellPriceLine;
    }

    return null;
  }
}
