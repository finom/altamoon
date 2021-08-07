export default function getPnlBalancePercent({
  positionAmt,
  lastPrice,
  entryPrice,
  totalWalletBalance,
}: {
  positionAmt: number;
  lastPrice: number;
  entryPrice: number;
  totalWalletBalance: number;
}): number {
  if (positionAmt === 0) return positionAmt; // pseudo position has 0 positionAmt
  const baseValue = positionAmt * entryPrice;

  const pnl = ((lastPrice - entryPrice) / entryPrice) * baseValue;

  return (pnl / totalWalletBalance) * 100 || 0;
}
