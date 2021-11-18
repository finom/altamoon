import * as api from '../../api';
import getPositionInfo from './getPositionInfo';

export default function eventAccountUpdate(
  this: Store['trading'],
  a: api.UserDataEventAccountUpdateData,
): void {
  a.P.forEach((pos) => {
    const position: api.FuturesPositionRisk = {
      ...this.allSymbolsPositionRisk[pos.s],
      positionAmt: pos.pa,
      entryPrice: pos.ep,
      unRealizedProfit: pos.up,
      marginType: pos.mt,
      isolatedWallet: pos.iw,
      positionSide: pos.ps,
    };

    this.allSymbolsPositionRisk[pos.s] = position;
  });

  this.openPositions = Object.values(this.allSymbolsPositionRisk)
    .filter((position) => !!+position.positionAmt)
    .map((position) => getPositionInfo.call(
      this, position, { lastPrice: +this.store.market.allSymbolsTickers[position.symbol]?.close },
    ))
    .sort(({ symbol: symA }, { symbol: symB }) => (symA > symB ? 1 : -1));
}
