import { TradingOrder } from '../../../store/types';
import { ChartAxis, PriceLinesDatum, ResizeData } from '../types';
import PriceLines from './PriceLines';

interface Params {
  axis: ChartAxis;
  onDragLimitOrder: (orderId: number, price: number) => void;
  onCancelOrder: (orderId: number) => void;
  onUpdateItems: (d: PriceLinesDatum[]) => void;
}

export default class OrderPriceLines extends PriceLines {
  #orders: TradingOrder[] = [];

  constructor({
    axis, onDragLimitOrder, onCancelOrder, onUpdateItems,
  }: Params, resizeData: ResizeData) {
    super({
      axis,
      items: [],
      isTitleVisible: true,
      lineStyle: 'solid',
      isBackgroundFill: true,
      onDragEnd: (d) => onDragLimitOrder(d.id as number, d.yValue ?? 0), // args ensure TS
      onClickClose: (d) => onCancelOrder(d.id as number),
      onUpdateItems,
    }, resizeData);
  }

  public updateOrderLines(givenOrders: TradingOrder[] | null): void {
    const orders = givenOrders ?? this.#orders;
    this.#orders = orders;

    const items: PriceLinesDatum[] = [
      ...orders
        .map((order): PriceLinesDatum => {
          const {
            price, side, origQty, executedQty, symbol, type, orderId, isCanceled,
          } = order;
          const color = side === 'BUY' ? 'var(--biduul-buy-color)' : 'var(--biduul-sell-color)';
          return ({
            isDraggable: type === 'LIMIT',
            yValue: price,
            isVisible: true,
            color: isCanceled ? 'var(--bs-gray)' : color,
            // TODO this is a potentially wrong way to retrieve
            // asset name from symbol name because of BNB/BUSD pairs
            title: `Limit ${origQty - executedQty} ${symbol.replace('USDT', '')}`,
            id: orderId,
            customData: { order },
            pointerEventsNone: isCanceled,
          });
        }),
      ...orders
        .filter(({ stopPrice }) => !!stopPrice)
        .map(({ stopPrice, side, orderId }): PriceLinesDatum => ({
          yValue: stopPrice,
          isVisible: true,
          color: side === 'BUY' ? 'var(--biduul-stop-buy-color)' : 'var(--biduul-stop-sell-color)',
          title: 'Stop price',
          id: orderId,
          customData: {},
        })),
    ];

    this.update({ items });
  }
}
