import { TradingOrder } from '../../../store/types';
import { ChartAxis, PriceLinesDatum, ResizeData } from '../types';
import PriceLines from './PriceLines';

interface Params {
  axis: ChartAxis;
  onDragLimitOrder: (clientOrderId: string, price: number) => void;
  onCancelOrder: (clientOrderId: string) => void;
  onUpdateItems: (d: PriceLinesDatum[]) => void;
}

export default class OrderPriceLines extends PriceLines {
  #orders: TradingOrder[] = [];

  // we neeed this to preserve line position when it was dragged
  // but not yet removed (not yet re-created)
  #forceOrderPrices: Record<string, number> = {};

  constructor({
    axis, onDragLimitOrder, onCancelOrder, onUpdateItems,
  }: Params, resizeData: ResizeData) {
    super({
      axis,
      items: [],
      isTitleVisible: true,
      lineStyle: 'solid',
      isBackgroundFill: true,
      onDragEnd: (d) => {
        this.#forceOrderPrices[d.id as string] = d.yValue ?? 0;
        onDragLimitOrder(d.id as string, d.yValue ?? 0);
      },
      onClickClose: (d) => onCancelOrder(d.id as string),
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
            price, side, origQty, executedQty, symbol, type, isCanceled, clientOrderId,
          } = order;
          const color = side === 'BUY' ? 'var(--altamoon-buy-color)' : 'var(--altamoon-sell-color)';
          return ({
            isDraggable: type === 'LIMIT',
            yValue: this.#forceOrderPrices[clientOrderId] ?? price,
            isVisible: true,
            color: isCanceled ? 'var(--bs-gray)' : color,
            opacity: isCanceled ? 0.5 : 1,
            // TODO this is a potentially wrong way to retrieve
            // asset name from symbol name because of BNB/BUSD pairs
            title: `Limit ${origQty - executedQty} ${symbol.replace('USDT', '')}`,
            id: clientOrderId,
            customData: { order },
            pointerEventsNone: isCanceled,
          });
        }),
      ...orders
        .filter(({ stopPrice }) => !!stopPrice)
        .map(({ stopPrice, side, clientOrderId }): PriceLinesDatum => ({
          yValue: stopPrice,
          isVisible: true,
          color: side === 'BUY' ? 'var(--altamoon-stop-buy-color)' : 'var(--altamoon-stop-sell-color)',
          title: 'Stop price',
          id: clientOrderId,
          customData: {},
        })),
    ];

    this.update({ items });
  }
}
