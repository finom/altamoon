// used by Chart Widget compoment

import { trigger } from '../../hooks/useOn';

export default function updateDrafts(this: altamoon.RootStore['trading'], {
  buyDraftPrice, sellDraftPrice, stopBuyDraftPrice, stopSellDraftPrice,
}: {
  buyDraftPrice: number | null;
  sellDraftPrice: number | null;
  stopBuyDraftPrice: number | null;
  stopSellDraftPrice: number | null;
}): void {
  const { tradingType } = this.store.persistent;
  if (typeof buyDraftPrice === 'number') {
    this.shouldShowLimitBuyPriceLine = true;
    this.limitBuyPrice = buyDraftPrice;
  } else {
    this.shouldShowLimitBuyPriceLine = false;
  }

  if (typeof sellDraftPrice === 'number') {
    this.shouldShowLimitSellPriceLine = true;
    this.limitSellPrice = sellDraftPrice;
  } else {
    this.shouldShowLimitSellPriceLine = false;
  }

  if (tradingType === 'STOP' || tradingType === 'STOP_MARKET') {
    if (typeof stopBuyDraftPrice === 'number') {
      this.shouldShowStopBuyDraftPriceLine = true;
      this.stopBuyPrice = stopBuyDraftPrice;
    } else {
      this.shouldShowStopBuyDraftPriceLine = false;
    }

    if (typeof stopSellDraftPrice === 'number') {
      this.shouldShowStopSellDraftPriceLine = true;
      this.stopSellPrice = stopSellDraftPrice;
    } else {
      this.shouldShowStopSellDraftPriceLine = false;
    }
  }

  trigger('updateDrafts');
}
