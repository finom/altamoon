import * as api from '../../api';
import { TradingPosition } from '../types';
import getPnl from './getPnl';
import getPnlBalancePercent from './getPnlBalancePercent';
import getPnlPositionPercent from './getPnlPositionPercent';

export default function getPositionInfo(
  this: altamoon.RootStore['trading'],
  positionRisk: api.FuturesPositionRisk,
  override: { side?: api.OrderSide; lastPrice?: number; isClosed?: boolean; } = {},
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

  const leverageBracket = this.store.account.leverageBrackets[symbol]?.find(
    ({ notionalCap }) => notionalCap > baseValue,
  ) ?? null;

  const maintMarginRatio = leverageBracket?.maintMarginRatio ?? 0;
  const { totalWalletBalance } = this.store.account;
  const side = override.side ?? (positionAmt >= 0 ? 'BUY' : 'SELL');
  const lastPrice = override.lastPrice
    ?? +(this.store.market.allSymbolsTickers[symbol]?.close ?? 0);
  const existingPosition = this.openPositions.find((pos) => pos.symbol === symbol);

  const position: TradingPosition = {
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
    breakEvenPrice: existingPosition?.breakEvenPrice ?? null,
    realizedPnl: existingPosition?.realizedPnl ?? null,
    entryPrice,
    positionAmt,
    liquidationPrice,
    isolatedWallet,
    isolatedMargin,
    calculatedMargin: (Math.abs(positionAmt) * entryPrice) / leverage,
    baseValue,
    side,
    leverage,
    marginType,
    symbol,
    baseAsset: this.store.market.futuresExchangeSymbols[symbol]?.baseAsset ?? 'UNKNOWN',
    pricePrecision: this.store.market.futuresExchangeSymbols[symbol]?.pricePrecision ?? 1,
    maxLeverage: leverageBracket?.initialLeverage ?? 1,
    maintMarginRatio,
    maintMargin: maintMarginRatio * baseValue - (leverageBracket?.cum ?? 0),
    leverageBracket,
    isClosed: override.isClosed ?? existingPosition?.isClosed ?? false,
  };

  return position;
}
