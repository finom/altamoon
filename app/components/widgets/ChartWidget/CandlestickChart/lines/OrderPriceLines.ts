import { TradingOrder, OrderToBeCreated } from '../../../../../store/types';
import { ChartAxis, PriceLinesDatum, ResizeData } from '../types';
import PriceLines from './PriceLines';
import formatMoneyNumber from '../../../../../lib/formatMoneyNumber';

interface Params {
  axis: ChartAxis;
  onDragLimitOrder: (clientOrderId: string, price: number) => void | Promise<void>;
  onCancelOrder: (clientOrderId: string) => void | Promise<void>;
  onUpdateItems: (d: PriceLinesDatum[]) => void;
}

export default class OrderPriceLines extends PriceLines {
  #totalWalletBalance = 0;

  #openOrders: TradingOrder[] = [];

  #ordersToBeCreated: OrderToBeCreated[] = [];

  #currentSymbolLeverage = 1;

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
        void onDragLimitOrder(d.id as string, d.yValue ?? 0);
      },
      onClickClose: (d) => onCancelOrder(d.id as string),
      onUpdateItems,
    }, resizeData);
  }

  public updateOrderLines = (data: {
    openOrders?: TradingOrder[];
    ordersToBeCreated?: OrderToBeCreated[];
    totalWalletBalance?: number;
    currentSymbolLeverage?: number;
  }): void => {
    if (typeof data.openOrders !== 'undefined') this.#openOrders = data.openOrders;
    if (typeof data.ordersToBeCreated !== 'undefined') this.#ordersToBeCreated = data.ordersToBeCreated;
    if (typeof data.totalWalletBalance !== 'undefined') this.#totalWalletBalance = data.totalWalletBalance;
    if (typeof data.currentSymbolLeverage !== 'undefined') this.#currentSymbolLeverage = data.currentSymbolLeverage;

    const items: PriceLinesDatum[] = [
      ...this.#ordersToBeCreated.map(({ clientOrderId, price, origQty }): PriceLinesDatum => {
        const size = price * origQty;
        const sizePercent = +(
          ((size / this.#currentSymbolLeverage) / this.#totalWalletBalance) * 100
        ).toFixed(1);
        return {
          id: clientOrderId,
          isDraggable: false,
          yValue: price,
          title: `Limit ${formatMoneyNumber(size)}$ (${sizePercent}%)`,
          color: 'var(--bs-gray)',
          opacity: 0.8,
        };
      }),
      ...this.#openOrders
        .map((order): PriceLinesDatum => {
          const {
            price, side, origQty, executedQty, type, isCanceled, clientOrderId,
          } = order;
          const color = side === 'BUY' ? 'var(--altamoon-buy-color)' : 'var(--altamoon-sell-color)';
          const size = price * (origQty - executedQty);
          const sizePercent = +(
            ((size / this.#currentSymbolLeverage) / this.#totalWalletBalance) * 100
          ).toFixed(1);
          return ({
            isDraggable: type === 'LIMIT',
            yValue: this.#forceOrderPrices[clientOrderId] ?? price,
            isVisible: true,
            color: isCanceled ? 'var(--bs-gray)' : color,
            opacity: isCanceled ? 0.8 : 1,
            // TODO this is a potentially wrong way to retrieve
            // asset name from symbol name because of BNB/BUSD pairs
            title: `Limit ${formatMoneyNumber(size)}$ (${sizePercent}%)`,
            id: clientOrderId,
            customData: { order },
            pointerEventsNone: isCanceled,
          });
        }),
      ...this.#openOrders
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
  };
}
