// used by Chart Widget compoment

export default function updateDrafts(this: Store['trading'], {
  buyDraftPrice, sellDraftPrice, stopBuyDraftPrice, stopSellDraftPrice,
}: {
  buyDraftPrice: number | null;
  sellDraftPrice: number | null;
  stopBuyDraftPrice: number | null;
  stopSellDraftPrice: number | null;
}): void {
  const { tradingType } = this.store.persistent;

  if (tradingType === 'LIMIT' || tradingType === 'STOP') {
    if (typeof buyDraftPrice === 'number') {
      this.limitBuyPrice = buyDraftPrice;
      this.shouldShowLimitBuyPriceLine = true;
    } else {
      this.shouldShowLimitBuyPriceLine = false;
    }

    if (typeof sellDraftPrice === 'number') {
      this.limitSellPrice = sellDraftPrice;
      this.shouldShowLimitSellPriceLine = true;
    } else {
      this.shouldShowLimitSellPriceLine = false;
    }
  }

  if (tradingType === 'STOP' || tradingType === 'STOP_MARKET') {
    if (typeof stopBuyDraftPrice === 'number') {
      this.stopBuyPrice = stopBuyDraftPrice;
      this.shouldShowStopBuyPriceLine = true;
    } else {
      this.shouldShowStopBuyPriceLine = false;
    }

    if (typeof stopSellDraftPrice === 'number') {
      this.stopSellPrice = stopSellDraftPrice;
      this.shouldShowStopSellPriceLine = true;
    } else {
      this.shouldShowStopSellPriceLine = false;
    }
  }
}
