import * as api from '../../api';
import getPositionInfo from './getPositionInfo';

export default function eventAccountUpdate(
  this: Store['trading'],
  a: api.UserDataEventAccountUpdateData,
): void {
  const amtIncreasedSymbols: string[] = [];
  const positions = a.P;

  if (!positions.length) return;

  // eslint-disable-next-line no-console
  console.info(`Received ${positions.length} updated position(s) (${positions.map((pos) => pos.s).join(', ')}).`);
  positions.forEach((pos) => {
    const prevAmt = +this.allSymbolsPositionRisk[pos.s].positionAmt;
    const newAmt = +pos.pa;
    const position: api.FuturesPositionRisk = {
      ...this.allSymbolsPositionRisk[pos.s],
      positionAmt: pos.pa,
      entryPrice: pos.ep,
      unRealizedProfit: pos.up,
      marginType: pos.mt,
      isolatedWallet: pos.iw,
      positionSide: pos.ps,
    };

    if (Math.abs(newAmt) > Math.abs(prevAmt)) {
      amtIncreasedSymbols.push(position.symbol);
    }

    this.allSymbolsPositionRisk[pos.s] = position;
  });

  this.openPositions = Object.values(this.allSymbolsPositionRisk)
    .filter((position) => !!+position.positionAmt)
    .map((position) => {
      const tradingPosition = getPositionInfo.call(
        this, position, {
          lastPrice: +this.store.market.allSymbolsTickers[position.symbol]?.close,
          // isClosed is definitely false if amount increased, otherwise use existing isClosed value
          isClosed: amtIncreasedSymbols.includes(position.symbol) ? false : undefined,
        },
      );

      // Websocket doesn't provide liq. price, see https://binance-docs.github.io/apidocs/futures/en/#event-balance-and-position-update
      tradingPosition.liquidationPrice = this.calculateLiquidationPrice(tradingPosition);

      return tradingPosition;
    })
    .sort(({ symbol: symA }, { symbol: symB }) => (symA > symB ? 1 : -1));

  positions.forEach(({ s: symbol }) => void this.loadPositionTrades(symbol));
}
