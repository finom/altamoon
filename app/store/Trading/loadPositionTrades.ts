import { throttle } from 'lodash';
import * as api from '../../api';

function getBreakEvenPrice(
  this: Store['trading'],
  trades: api.FuturesUserTrade[],
  entryPrice: number,
  positionAmt: number,
): number {
  const baseValue = positionAmt * entryPrice;

  let pnl = 0;
  trades.forEach((x) => { pnl += +x.realizedPnl; });

  let fees = 0;
  trades.forEach((x) => { fees += +x.commission; });
  fees += this.getFeeRate('taker') * Math.abs(baseValue); // position closing fee

  return (entryPrice * (fees - pnl)) / baseValue + entryPrice;
}

const tradesCache: Record<string, api.FuturesUserTrade[]> = {};

async function loadPositionTradesOrig(this: Store['trading'], symbol: string): Promise<void> {
  const position = this.openPositions.find((x) => x.symbol === symbol);
  if (!position) return;
  const direction = position.side === 'BUY' ? 1 : -1;

  let orderSum = 0;
  let requestedTrades: api.FuturesUserTrade[];
  let trades: api.FuturesUserTrade[] = tradesCache[symbol] ?? [];

  do {
    const options: Parameters<typeof api.futuresUserTrades>[0] = { symbol, limit: 1000 };
    const hasTrades = trades.length;

    if (hasTrades) {
      // start from the last trade ID
      options.fromId = trades[trades.length - 1].id;
    } else {
      // else start from today minus 7 days
      options.startTime = Date.now() - 1000 * 60 * 60 * 24 * 7;
    }
    // eslint-disable-next-line no-await-in-loop
    requestedTrades = await api.futuresUserTrades(options);
    if (hasTrades) {
      // remove first item if fromId is used
      requestedTrades.shift();
    }
    trades = [...trades, ...requestedTrades]; // append requestedTrades to trades
  } while (requestedTrades.length === 1000);

  let i = trades.length - 1;

  for (; i >= 0; i -= 1) {
    const trade = trades[i];
    const orderDirection = trade.side === 'BUY' ? 1 : -1;
    orderSum += orderDirection * +trade.qty;

    if ((direction * position.positionAmt * +trade.price - orderSum * +trade.price) <= 0.01) {
      break;
    }
  }

  trades = trades.slice(i, trades.length);

  tradesCache[symbol] = trades;

  this.openPositions = this.openPositions.map((pos) => (
    pos.symbol === symbol ? {
      ...pos, breakEvenPrice: getBreakEvenPrice.call(this, trades, pos.entryPrice, pos.positionAmt),
    } : pos
  ));
}

const loadPositionTrades = throttle(loadPositionTradesOrig, 1000);

export default loadPositionTrades;

/*
TODO: Remove this code, it's preserved temporarily
do {
      // eslint-disable-next-line no-await-in-loop
      requestedTrades = await api.futuresUserTrades({ symbol, limit: 1000, endTime });

      trades = requestedTrades.concat(trades ?? []); // prepend requestedTrades to trades

      endTime = requestedTrades[0]?.time;

      i += requestedTrades.length - 1;

      for (; i >= 0; i -= 1) {
        const trade = trades[i];

        const orderDirection = trade.side === 'BUY' ? 1 : -1;
        orderSum += orderDirection * +trade.qty;

        if ((direction * position.positionAmt * +trade.price - orderSum * +trade.price) <= 0.01) {
          break;
        }
      }
  } while (requestedTrades.length === 1000); */
