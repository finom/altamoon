import * as d3 from 'd3';
import { OrderSide } from '../../../api';
import { RootStore } from '../../../store';
import formatBalanceMoneyNumber from '../../formatBalanceMoneyNumber';
import { ChartAxis, DraftPrices, ResizeData } from '../types';
import PriceLines from './PriceLines';

interface Params {
  axis: ChartAxis;
  getPseudoPosition: RootStore['trading']['getPseudoPosition'];
  onUpdateDrafts: ((r: DraftPrices) => void);
  onClickDraftCheck: ((r: DraftPrices, side: OrderSide) => void);
}

export default class DraftPriceLines extends PriceLines {
  #canCreateDraftLines = true;

  #onUpdateDrafts: Params['onUpdateDrafts'];

  #getPseudoPosition: Params['getPseudoPosition'];

  #lastPrice = 0;

  constructor({
    axis, getPseudoPosition, onUpdateDrafts, onClickDraftCheck,
  }: Params, resizeData: ResizeData) {
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
      }, {
        id: 'LIQ_BUY',
        isVisible: false,
        isDraggable: false,
        isCheckable: false,
        isClosable: false,
        color: 'var(--bs-red)',
        title: 'Buy liquidation',
        isTitleVisible: false,
      }, {
        id: 'LIQ_SELL',
        isVisible: false,
        isDraggable: false,
        isCheckable: false,
        isClosable: false,
        color: 'var(--bs-red)',
        title: 'Sell liquidation',
        isTitleVisible: false,
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

    this.#onUpdateDrafts = onUpdateDrafts;
    this.#getPseudoPosition = getPseudoPosition;
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

  public updateDraftLines = (data: {
    canCreateDraftLines?: boolean;
    lastPrice?: number;

    buyDraftPrice?: number | null;
    sellDraftPrice?: number | null;
    buyDraftSize?: number | null;
    sellDraftSize?: number | null;
    shouldShowBuyDraftPrice?: boolean;
    shouldShowSellDraftPrice?: boolean;

    stopBuyDraftPrice?: number | null;
    stopSellDraftPrice?: number | null;
    shouldShowStopBuyDraftPrice?: boolean;
    shouldShowStopSellDraftPrice?: boolean;
  }): void => {
    if (typeof data.canCreateDraftLines !== 'undefined') this.#canCreateDraftLines = data.canCreateDraftLines;
    if (typeof data.lastPrice !== 'undefined') this.#lastPrice = data.lastPrice;

    if (typeof data.buyDraftPrice !== 'undefined' && typeof data.buyDraftSize !== 'undefined') {
      this.updateItem('BUY', {
        yValue: data.buyDraftPrice ?? 0,
        title: `Buy draft (${data.buyDraftSize ? formatBalanceMoneyNumber(data.buyDraftSize) : 0} USDT)`,
      });

      this.updateItem('LIQ_BUY', {
        yValue: this.#getPseudoPosition({ side: 'BUY' })?.liquidationPrice ?? 0,
      });
    }
    if (typeof data.sellDraftPrice !== 'undefined' && typeof data.sellDraftSize !== 'undefined') {
      this.updateItem('SELL', {
        yValue: data.sellDraftPrice ?? 0,
        title: `Sell draft (${data.sellDraftSize ? formatBalanceMoneyNumber(data.sellDraftSize) : 0} USDT)`,
      });

      this.updateItem('LIQ_SELL', {
        yValue: this.#getPseudoPosition({ side: 'SELL' })?.liquidationPrice ?? 0,
      });
    }

    if (typeof data.shouldShowBuyDraftPrice !== 'undefined') {
      this.updateItem('BUY', { isVisible: data.shouldShowBuyDraftPrice });
      this.updateItem('LIQ_BUY', { isVisible: data.shouldShowBuyDraftPrice });
    }
    if (typeof data.shouldShowSellDraftPrice !== 'undefined') {
      this.updateItem('SELL', { isVisible: data.shouldShowSellDraftPrice });
      this.updateItem('LIQ_SELL', { isVisible: data.shouldShowSellDraftPrice });
    }

    if (typeof data.stopBuyDraftPrice !== 'undefined') {
      this.updateItem('STOP_BUY', { yValue: data.stopBuyDraftPrice ?? 0 });
    }
    if (typeof data.stopSellDraftPrice !== 'undefined') {
      this.updateItem('STOP_SELL', { yValue: data.stopSellDraftPrice ?? 0 });
    }

    if (typeof data.shouldShowStopBuyDraftPrice !== 'undefined') this.updateItem('STOP_BUY', { isVisible: data.shouldShowStopBuyDraftPrice });
    if (typeof data.shouldShowStopSellDraftPrice !== 'undefined') this.updateItem('STOP_SELL', { isVisible: data.shouldShowStopSellDraftPrice });
  };

  public appendTo = (
    parent: Element,
    resizeData: ResizeData,
    { wrapperCSSStyle }: { wrapperCSSStyle?: Partial<CSSStyleDeclaration> } = {},
  ): void => {
    super.appendTo(parent, resizeData, { wrapperCSSStyle });
    this.eventsArea?.on('dblclick', this.#onDoubleClick);
  };

  #onDoubleClick = (evt: MouseEvent): void => {
    evt.stopPropagation();
    evt.preventDefault();

    if (!this.#canCreateDraftLines) return;

    const coords = d3.pointer(evt);
    const yValue = this.invertY(coords[1]);

    const side: OrderSide = yValue < this.#lastPrice ? 'BUY' : 'SELL';

    this.updateItem(side, { yValue, isVisible: true });
    this.#onUpdateDrafts(this.getDraftPrices());
  };
}
