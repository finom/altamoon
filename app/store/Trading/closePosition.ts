import * as api from '../../api';
import notify from '../../lib/notify';

export default async function closePosition(this: Store['trading'], symbol: string, amt?: number): Promise<api.FuturesOrder | null> {
  const position = this.openPositions.find((pos) => pos.symbol === symbol);

  if (!position) {
    throw new Error(`No open position of symbol "${symbol}" found`);
  }

  const { positionAmt } = position;
  let result: api.FuturesOrder | null = null;

  const amount = typeof amt !== 'undefined' ? amt : positionAmt;

  this.openPositions = this.openPositions.map((pos) => (pos.symbol === symbol ? {
    ...pos,
    isClosed: true,
  } : pos));

  try {
    if (amount < 0) {
      result = await api.futuresMarketOrder('BUY', symbol, -amount, { reduceOnly: true });
    } else {
      result = await api.futuresMarketOrder('SELL', symbol, amount, { reduceOnly: true });
    }
  } catch (e) {
    // reset isClosed since the position isn't closed because of an error
    this.openPositions = this.openPositions.map((pos) => (pos.symbol === symbol ? {
      ...pos,
      isClosed: false,
    } : pos));
  }

  if (result) {
    if (Math.abs(amount) < Math.abs(positionAmt)) {
      notify('success', `Position ${symbol} is reduced by ${Math.abs(amount)}`);
    } else {
      notify('success', `Position ${symbol} is closed`);
    }
  }

  return result;
}
