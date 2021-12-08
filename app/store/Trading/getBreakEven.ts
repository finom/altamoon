import * as api from '../../api';

interface Arg {
  entryPrice: number;
  positionAmt: number;
  trades: api.FuturesUserTrades[];
}
export default function getBreakEven(this: Store['trading'], {
  entryPrice,
  positionAmt,
  trades,
}: Arg): number {
  const baseValue = positionAmt * entryPrice;

  let pnl = 0;
  trades.forEach((x) => { pnl += +x.realizedPnl; });

  let fees = 0;
  trades.forEach((x) => { fees += +x.commission; });
  fees += this.getFeeRate('taker') * Math.abs(baseValue); // position closing fee

  return (entryPrice * (fees - pnl)) / baseValue + entryPrice;
}
