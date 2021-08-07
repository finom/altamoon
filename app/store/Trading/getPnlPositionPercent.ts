import getPnl from './getPnl';

export default function getPnlPositionPercent({
  positionAmt,
  lastPrice,
  entryPrice,
  leverage,
}: {
  positionAmt: number;
  lastPrice: number;
  entryPrice: number;
  leverage: number;
}): number {
  if (positionAmt === 0) return positionAmt; // pseudo position has 0 positionAmt
  const pnl = getPnl({ positionAmt, lastPrice, entryPrice });
  const baseValue = Math.abs(positionAmt * entryPrice);

  return (pnl * 100) / ((baseValue + pnl) / leverage);
}
