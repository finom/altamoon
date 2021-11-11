import * as api from '../../api';
import getPositionInfo from './getPositionInfo';

export default function eventAccountUpdate(
  this: Store['trading'],
  a: api.UserDataEventAccountUpdateData,
): void {
  // simulate FuturesPositionRisk object
  this.openPositions = a.P.map((pos) => {
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

    const tradingPosition = getPositionInfo.call(this, position);

    // Handle edge case when user clicks "close" button and an order executes adding more tokens to the position
    if (Math.abs(newAmt) > Math.abs(prevAmt) && tradingPosition.isClosed === true) {
      tradingPosition.isClosed = false;
    }

    return tradingPosition;
  }).filter((position) => !!+position.positionAmt); // remove positions because of zero amt
}
