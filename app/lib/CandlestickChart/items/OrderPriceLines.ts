import { TradingOrder } from '../../../store/types';
import { ChartAxis, PriceLinesDatum, ResizeData } from '../types';
import PriceLines from './PriceLines';

interface Params {
  axis: ChartAxis;
  onDragLimitOrder: (orderId: number, price: number) => void;
}

export default class OrderPriceLines extends PriceLines {
  constructor({ axis, onDragLimitOrder }: Params, resizeData: ResizeData) {
    super({
      axis,
      items: [],
      isTitleVisible: true,
      lineStyle: 'solid',
      onDragEnd: (d) => onDragLimitOrder(d.id as number, d.yValue ?? 0), // args ensure TS
      onClickTitle: () => {},
    }, resizeData);
  }

  public updateOrderLines(orders: TradingOrder[]): void {
    const items: PriceLinesDatum[] = [
      ...orders
        .map(({
          price, side, origQty, executedQty, symbol, type, orderId,
        }): PriceLinesDatum => ({
          isDraggable: type === 'LIMIT',
          yValue: price,
          isVisible: true,
          color: side === 'BUY' ? 'var(--biduul-buy-color)' : 'var(--biduul-sell-color)',
          // TODO this is a potentially wrong way to retrieve
          // asset name from symbol name because of BNB/BUSD pairs
          title: `Limit ${origQty - executedQty} ${symbol.replace('USDT', '')}`,
          id: orderId,
        })),
      ...orders
        .filter(({ stopPrice }) => !!stopPrice)
        .map(({ stopPrice, side, orderId }): PriceLinesDatum => ({
          yValue: stopPrice,
          isVisible: true,
          color: side === 'BUY' ? 'var(--biduul-stop-buy-color)' : 'var(--biduul-stop-sell-color)',
          title: 'Stop price',
          id: orderId,
        })),
    ];

    this.update({ items });
  }
}
