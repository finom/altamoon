import * as api from '../../api';
import getPositionInfo from './getPositionInfo';

export default function eventAccountUpdate(
  this: Store['trading'],
  a: api.UserDataEventAccountUpdateData,
): void {
  this.openPositions = a.P.map((pos) => {
    const position: api.FuturesPositionRisk = {
      ...this.allSymbolsPositionRisk[pos.s],
      positionAmt: pos.pa,
      entryPrice: pos.ep,
      unRealizedProfit: pos.up,
      marginType: pos.mt,
      isolatedWallet: pos.iw,
      positionSide: pos.ps,
    };

    return getPositionInfo.call(this, position);
  });
}
