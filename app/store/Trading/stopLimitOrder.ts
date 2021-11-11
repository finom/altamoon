import * as api from '../../api';
import notify from '../../lib/notify';
import floorPriceByTickSize from './floorPriceByTickSize';

export default async function stopLimitOrder(this: Store['trading'], {
  side, quantity, price, stopPrice, symbol, reduceOnly = false, postOnly = false, newClientOrderId,
}: {
  side: api.OrderSide;
  quantity: number;
  price: number;
  stopPrice: number;
  symbol: string;
  reduceOnly?: boolean;
  postOnly?: boolean;
  newClientOrderId?: string;
}): Promise<api.FuturesOrder | null> {
  try {
    const result = await api.futuresStopLimitOrder(
      side,
      symbol,
      quantity,
      floorPriceByTickSize(this.store.market.futuresExchangeSymbols[symbol], price),
      stopPrice,
      { reduceOnly, timeInForce: postOnly ? 'GTX' : 'GTC', newClientOrderId },
    );

    notify('success', `Stop limit order for ${symbol} is created`);

    if (side === 'BUY') {
      this.shouldShowLimitBuyPriceLine = false;
      this.shouldShowStopBuyDraftPriceLine = false;
    } else {
      this.shouldShowLimitSellPriceLine = false;
      this.shouldShowStopSellDraftPriceLine = false;
    }

    return result;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    return null;
  }
}
