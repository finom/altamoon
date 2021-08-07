export default function getPnl({
  positionAmt,
  lastPrice,
  entryPrice,
}: {
  positionAmt: number;
  lastPrice: number;
  entryPrice: number;
}): number {
  return positionAmt * (lastPrice - entryPrice);
}
