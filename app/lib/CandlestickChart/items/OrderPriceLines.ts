import { TradingOrder } from '../../../store/types';
import { ChartAxis, PriceLinesDatum, ResizeData } from '../types';
import PriceLines from './PriceLines';

export default class OrderPriceLines extends PriceLines {
  constructor({ axis }: { axis: ChartAxis; }, resizeData: ResizeData) {
    super({
      axis,
      items: [],
      isTitleVisible: true,
      isDraggable: false,
      lineStyle: 'solid',
      onDragEnd: () => {},
      onClickTitle: () => {},
    }, resizeData);
  }

  public updateOrderLines(orders: TradingOrder[]): void {
    const items: PriceLinesDatum[] = [
      ...orders
        .map(({
          price, side, origQty, executedQty, symbol,
        }): PriceLinesDatum => ({
          yValue: price,
          isVisible: true,
          color: side === 'BUY' ? 'var(--biduul-buy-color)' : 'var(--biduul-sell-color)',
          // TODO this is a potentially wrong way to retrieve
          // asset name from symbol name because of BNB/BUSD pairs
          title: `Limit ${origQty - executedQty} ${symbol.replace('USDT', '')}`,
        })),
      ...orders
        .filter(({ stopPrice }) => !!stopPrice)
        .map(({ stopPrice, side }): PriceLinesDatum => ({
          yValue: stopPrice,
          isVisible: true,
          color: side === 'BUY' ? 'var(--biduul-stop-buy-color)' : 'var(--biduul-stop-sell-color)',
          title: 'Stop price',
        })),
    ];

    this.update({ items });
  }
}
