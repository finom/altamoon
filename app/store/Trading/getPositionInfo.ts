import * as api from '../../api';
import { TradingPosition } from '../types';
import getPnl from './getPnl';
import getPnlBalancePercent from './getPnlBalancePercent';
import getPnlPositionPercent from './getPnlPositionPercent';

export default function getPositionInfo(
  this: Store['trading'], positionRisk: api.FuturesPositionRisk, lastPrice: number,
): TradingPosition {
  const positionAmt = +positionRisk.positionAmt;
  const entryPrice = +positionRisk.entryPrice;
  const leverage = +positionRisk.leverage;
  const liquidationPrice = +positionRisk.liquidationPrice;
  const isolatedWallet = +positionRisk.isolatedWallet;
  const isolatedMargin = +positionRisk.isolatedMargin;
  const { marginType, symbol } = positionRisk;
  const baseValue = positionAmt * entryPrice;
  const initialAmt = positionAmt >= 0 ? Math.max(
    this.openPositions.find((p) => p.symbol === symbol)?.initialAmt ?? 0,
    positionAmt,
  ) : Math.min(
    this.openPositions.find((p) => p.symbol === symbol)?.initialAmt ?? 0,
    positionAmt,
  );
  const bracket = this.store.account.leverageBrackets[symbol]?.find(
    ({ notionalCap }) => notionalCap > baseValue,
  );
  const maintMarginRatio = bracket?.maintMarginRatio ?? 0;
  const { totalWalletBalance } = this.store.account;

  return {
    // if positionAmt is increased, then use it as initial value,
    // if decrreased or remains the same then do nothing
    initialAmt,
    initialValue: initialAmt * entryPrice,
    lastPrice,
    pnl: getPnl({
      positionAmt,
      lastPrice,
      entryPrice,
    }),
    pnlPositionPercent: getPnlPositionPercent({
      positionAmt,
      lastPrice,
      entryPrice,
      leverage,
    }),
    pnlBalancePercent: getPnlBalancePercent({
      positionAmt,
      lastPrice,
      entryPrice,
      totalWalletBalance,
    }),
    entryPrice,
    positionAmt,
    liquidationPrice,
    isolatedWallet,
    isolatedMargin,
    baseValue,
    side: positionAmt >= 0 ? 'BUY' : 'SELL',
    leverage,
    marginType,
    symbol,
    baseAsset: this.store.market.futuresExchangeSymbols[symbol]?.baseAsset ?? 'UNKNOWN',
    pricePrecision: this.store.market.futuresExchangeSymbols[symbol]?.pricePrecision ?? 1,
    maxLeverage: bracket?.initialLeverage ?? 1,
    maintMarginRatio,
    maintMargin: maintMarginRatio * baseValue,
  };
}
