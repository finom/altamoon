import * as api from '../../api';
import notify from '../../lib/notify';

export default async function closePosition(this: Store['trading'], symbol: string, amt?: number): Promise<api.FuturesOrder | null> {
  try {
    const position = this.openPositions.find((pos) => pos.symbol === symbol);

    if (!position) {
      throw new Error(`No open position of symbol "${symbol}" found`);
    }

    const { positionAmt } = position;
    let result;

    const amount = typeof amt !== 'undefined' ? amt : positionAmt;

    this.openPositions = this.openPositions.map((pos) => (pos.symbol === symbol ? {
      ...pos,
      isClosed: true,
    } : pos));

    if (amount < 0) {
      result = await api.futuresMarketOrder('BUY', symbol, -amount, { reduceOnly: true });
    } else {
      result = await api.futuresMarketOrder('SELL', symbol, amount, { reduceOnly: true });
    }

    if (Math.abs(amount) < Math.abs(positionAmt)) {
      notify('success', `Position ${symbol} is reduced by ${Math.abs(amount)}`);
    } else {
      notify('success', `Position ${symbol} is closed`);
    }

    return result;
  } catch {
    return null;
  }
}
