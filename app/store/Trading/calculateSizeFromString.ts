export default function calculateSizeFromString(
  this: altamoon.RootStore['trading'],
  symbol: string,
  sizeStr: string,
  {
    leverage: givenLeverage, isPercentMode,
  }: { leverage?: number; isPercentMode?: boolean; } = {},
): number {
  const { totalWalletBalance } = this.store.account;
  const positionRisk = this.allSymbolsPositionRisk[symbol];
  if (!positionRisk) return 0;
  const leverage = givenLeverage ?? +positionRisk.leverage;

  const dirtyMarginInsufficientFix = sizeStr === '100%' ? 1 - (leverage * 0.002) : 1;

  return sizeStr.endsWith('%') || isPercentMode
    ? (+sizeStr.replace('%', '') / 100) * totalWalletBalance * leverage * dirtyMarginInsufficientFix || 0
    : +sizeStr || 0;
}
