import { OrderSide } from '../../../api';
import { ChartAxis, ResizeData } from '../types';
import PriceLines from './PriceLines';

export default class DraftPriceLines extends PriceLines {
  constructor({ axis, onUpdateDrafts, onClickDraftCheck }: {
    axis: ChartAxis;
    onUpdateDrafts: ((r: {
      buyDraftPrice: number | null;
      sellDraftPrice: number | null;
      stopBuyDraftPrice: number | null;
      stopSellDraftPrice: number | null;
    }) => void);
    onClickDraftCheck: ((r: {
      buyDraftPrice: number | null;
      sellDraftPrice: number | null;
      stopBuyDraftPrice: number | null;
      stopSellDraftPrice: number | null;
    }, side: OrderSide) => void);
  }, resizeData: ResizeData) {
    super({
      axis,
      items: [{
        id: 'BUY',
        isVisible: false,
        isDraggable: true,
        isCheckable: true,
        color: 'var(--biduul-buy-color)',
        title: 'Buy draft',
      }, {
        id: 'SELL',
        isVisible: false,
        isDraggable: true,
        isCheckable: true,
        color: 'var(--biduul-sell-color)',
        title: 'Sell draft',
      }, {
        id: 'STOP_BUY',
        isVisible: false,
        isDraggable: true,
        color: 'var(--biduul-stop-buy-color)',
        title: 'Stop buy draft',
      }, {
        id: 'STOP_SELL',
        isVisible: false,
        isDraggable: true,
        color: 'var(--biduul-stop-sell-color)',
        title: 'Stop sell draft',
      }],
      isTitleVisible: true,
      lineStyle: 'dashed',
      onDragEnd: () => onUpdateDrafts(this.getDraftPrices()),
      onClickCheck: (datum) => {
        onClickDraftCheck(this.getDraftPrices(), datum.id === 'SELL' || datum.id === 'STOP_SELL' ? 'SELL' : 'BUY');
      },
      onClickClose: (datum) => {
        this.updateItem(datum.id as string, { isVisible: false });
        onUpdateDrafts(this.getDraftPrices());
      },
    }, resizeData);
  }

  public getDraftPrices = (): {
    buyDraftPrice: number | null;
    sellDraftPrice: number | null;
    stopBuyDraftPrice: number | null;
    stopSellDraftPrice: number | null;
  } => {
    const items = this.getItems();
    const buyItem = items.find(({ id }) => id === 'BUY');
    const sellItem = items.find(({ id }) => id === 'SELL');
    const stopBuyItem = items.find(({ id }) => id === 'STOP_BUY');
    const stopSellItem = items.find(({ id }) => id === 'STOP_SELL');

    const buyDraftPrice = buyItem?.isVisible && buyItem.yValue ? buyItem.yValue : null;
    const sellDraftPrice = sellItem?.isVisible && sellItem.yValue ? sellItem.yValue : null;
    const stopBuyDraftPrice = stopBuyItem?.isVisible && stopBuyItem.yValue
      ? stopBuyItem.yValue : null;
    const stopSellDraftPrice = stopSellItem?.isVisible && stopSellItem.yValue
      ? stopSellItem.yValue : null;

    return {
      buyDraftPrice,
      sellDraftPrice,
      stopBuyDraftPrice,
      stopSellDraftPrice,
    };
  };
}
