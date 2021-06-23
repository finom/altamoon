import { ChartAxis, ResizeData } from '../types';
import PriceLines from './PriceLines';

type Handler = ((r: { buyDraftPrice: number | null; sellDraftPrice: number | null }) => void);

export default class DraftPriceLines extends PriceLines {
  constructor({
    axis, onDragEnd, onClickTitle,
  }: {
    axis: ChartAxis;
    onDragEnd: Handler;
    onClickTitle: Handler;
  }, resizeData: ResizeData) {
    super({
      axis,
      items: [{
        id: 'BUY',
        isVisible: false,
        color: 'var(--biduul-buy-color)',
        title: 'Buy draft',
      }, {
        id: 'SELL',
        isVisible: false,
        color: 'var(--biduul-sell-color)',
        title: 'Sell draft',
      }],
      isTitleVisible: true,
      isDraggable: true,
      lineStyle: 'dashed',
      onDragEnd: () => onDragEnd(this.getDraftPrices()),
      onClickTitle: (datum) => {
        this.updateItem(datum.id as string, { isVisible: false });
        onClickTitle(this.getDraftPrices());
      },
    }, resizeData);
  }

  public getDraftPrices = (): { buyDraftPrice: number | null; sellDraftPrice: number | null } => {
    const items = this.getItems();
    const buyItem = items.find(({ id }) => id === 'BUY');
    const sellItem = items.find(({ id }) => id === 'SELL');

    const buyDraftPrice = buyItem?.isVisible && buyItem.yValue ? buyItem.yValue : null;
    const sellDraftPrice = sellItem?.isVisible && sellItem.yValue ? sellItem.yValue : null;

    return {
      buyDraftPrice,
      sellDraftPrice,
    };
  };
}
