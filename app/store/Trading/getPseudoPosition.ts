import * as api from '../../api';
import { TradingPosition } from '../types';
import getPositionInfo from './getPositionInfo';

export default function getPseudoPosition(
  this: Store['trading'],
  { side = 'BUY', price: priceOverride }: { side?: api.OrderSide, price?: number } = {},
): TradingPosition | null {
  const { tradingType, symbol } = this.store.persistent;
  const {
    limitSellPrice,
    limitBuyPrice,
    exactSizeMarketBuyStr,
    exactSizeMarketSellStr,
    exactSizeStopMarketBuyStr,
    exactSizeStopMarketSellStr,
    exactSizeLimitBuyStr,
    exactSizeLimitSellStr,
    exactSizeStopLimitBuyStr,
    exactSizeStopLimitSellStr,
  } = this;

  const lastPrice = this.store.market.currentSymbolLastPrice ?? 0;
  const limitPrice = side === 'BUY' ? limitBuyPrice : limitSellPrice;

  const exactSizeStrMap: Record<Extract<api.OrderType, 'LIMIT' | 'MARKET' | 'STOP' | 'STOP_MARKET'>, string> = {
    MARKET: side === 'BUY' ? exactSizeMarketBuyStr : exactSizeMarketSellStr,
    LIMIT: side === 'BUY' ? exactSizeLimitBuyStr : exactSizeLimitSellStr,
    STOP: side === 'BUY' ? exactSizeStopMarketBuyStr : exactSizeStopMarketSellStr,
    STOP_MARKET: side === 'BUY' ? exactSizeStopLimitBuyStr : exactSizeStopLimitSellStr,
  };

  const exactSizeStr = exactSizeStrMap[tradingType as 'LIMIT' | 'MARKET' | 'STOP' | 'STOP_MARKET'] || '0';
  const price = priceOverride ?? (tradingType.includes('MARKET') ? lastPrice : (limitPrice ?? lastPrice));

  const quantity = this.calculateQuantity({
    symbol,
    price,
    size: this.calculateSizeFromString(symbol, exactSizeStr),
  });
  const positionRisk = this.allSymbolsPositionRisk[this.store.persistent.symbol];

  if (!positionRisk) return null;

  const pseudoPositionRisk: api.FuturesPositionRisk = {
    ...positionRisk,
    positionAmt: ((side === 'SELL' ? -1 : 1) * quantity).toString(),
    entryPrice: price.toString(),
    leverage: this.currentSymbolLeverage.toString(),
    isolatedWallet: ((quantity * price) / this.currentSymbolLeverage).toString(),
  };

  const position = getPositionInfo.call(this, pseudoPositionRisk, { lastPrice });
  position.liquidationPrice = this.calculateLiquidationPrice(position, { side });
  return position;
}