import { RootStore } from '../../../store';
import { TradingOrder } from '../../../store/types';
import { ChartAxis, PriceLinesDatum, ResizeData } from '../types';
import PriceLines from './PriceLines';

interface Params {
  axis: ChartAxis;
  calculateLiquidationPrice: RootStore['trading']['calculateLiquidationPrice'];
  onDragLimitOrder: (orderId: number, price: number) => void;
  onCancelOrder: (orderId: number) => void;
}

export default class OrderPriceLines extends PriceLines {
  #calculateLiquidationPrice: Params['calculateLiquidationPrice'];

  #orders: TradingOrder[] = [];

  constructor({
    axis, calculateLiquidationPrice, onDragLimitOrder, onCancelOrder,
  }: Params, resizeData: ResizeData) {
    super({
      axis,
      items: [],
      isTitleVisible: true,
      lineStyle: 'solid',
      isBackgroundFill: true,
      onDragEnd: (d) => onDragLimitOrder(d.id as number, d.yValue ?? 0), // args ensure TS
      onClickClose: (d) => onCancelOrder(d.id as number),
      onDrag: (d) => {
        const order = this.#orders.find(({ orderId }) => orderId === d.id);

        if (!order) return; // TS ensure

        this.updateItem(`LIQ_${d.id as string}`, {
          yValue: this.#getLiquidationPrice({
            ...order,
            price: d.yValue ?? 0,
          }),
        });
      },
    }, resizeData);

    this.#calculateLiquidationPrice = calculateLiquidationPrice;
  }

  public updateOrderLines(givenOrders: TradingOrder[] | null): void {
    const orders = givenOrders ?? this.#orders;
    this.#orders = orders;

    const items: PriceLinesDatum[] = [
      ...orders
        .map(({
          price, side, origQty, executedQty, symbol, type, orderId,
        }): PriceLinesDatum => ({
          isDraggable: type === 'LIMIT',
          yValue: price,
          isVisible: true,
          color: side === 'BUY' ? '#20884c' : '#6d28d2',
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
      ...orders
        .map((order) => ({
          yValue: this.#getLiquidationPrice(order),
          title: 'Order liquidation',
          color: 'var(--bs-red)',
          isTitleVisible: false,
          lineStyle: 'dashed' as const,
          id: `LIQ_${order.orderId}`,
        })),
    ];

    this.update({ items });
  }

  #getLiquidationPrice = ({
    price, side, origQty, executedQty, symbol, marginType, leverageBracket, leverage,
  }: TradingOrder): number => this.#calculateLiquidationPrice({
    positionAmt: (side === 'SELL' ? -1 : 1) * (origQty - executedQty),
    entryPrice: price,
    symbol,
    leverageBracket,
    side,
    marginType,
    isolatedWallet: ((origQty - executedQty) * price) / leverage,
    leverage,
  });
}
