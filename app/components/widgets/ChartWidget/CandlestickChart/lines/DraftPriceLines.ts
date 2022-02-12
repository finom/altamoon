import * as d3 from 'd3';
import { RootStore } from '../../../../../store';
import { OrderSide } from '../../../../../api';
import formatMoneyNumber from '../../../../../lib/formatMoneyNumber';
import {
  ChartAxis, DraftPrices, PriceLinesDatum, ResizeData,
} from '../types';
import PriceLines from './PriceLines';

interface Params {
  axis: ChartAxis;
  getPseudoPosition: RootStore['trading']['getPseudoPosition'];
  calculateQuantity: RootStore['trading']['calculateQuantity'];
  onUpdateDrafts: (r: DraftPrices) => void;
  onDoubleClick: () => void;
  onClickDraftCheck: (
    r: DraftPrices & { newClientOrderId: string; }, side: OrderSide,
  ) => Promise<void>;
  onUpdateItems: (d: PriceLinesDatum[]) => void;
}

export default class DraftPriceLines extends PriceLines {
  #getPseudoPosition: Params['getPseudoPosition'];

  #calculateQuantity: Params['calculateQuantity'];

  #handleUpdateDrafts: Params['onUpdateDrafts'];

  #handleDoubleClick: Params['onDoubleClick'];

  #lastPrice = 0;

  #buyDraftPrice: number | null = 0;

  #buyDraftSize: number | null = 0;

  #sellDraftPrice: number | null = 0;

  #sellDraftSize: number | null = 0;

  #totalWalletBalance = 0;

  #currentSymbolLeverage = 1;

  constructor({
    axis, getPseudoPosition, calculateQuantity, onUpdateDrafts,
    onClickDraftCheck, onUpdateItems, onDoubleClick,
  }: Params, resizeData: ResizeData) {
    super({
      axis,
      items: [{
        id: 'BUY',
        isVisible: false,
        isDraggable: true,
        isCheckable: true,
        color: 'var(--altamoon-buy-color)',
        title: 'Buy draft',
        customData: { draftAmount: 0 },
      }, {
        id: 'SELL',
        isVisible: false,
        isDraggable: true,
        isCheckable: true,
        color: 'var(--altamoon-sell-color)',
        title: 'Sell draft',
        customData: { draftAmount: 0 },
      }, {
        id: 'STOP_BUY',
        isVisible: false,
        isDraggable: true,
        color: 'var(--altamoon-stop-buy-color)',
        title: 'Stop buy draft',
        customData: {},
      }, {
        id: 'STOP_SELL',
        isVisible: false,
        isDraggable: true,
        color: 'var(--altamoon-stop-sell-color)',
        title: 'Stop sell draft',
        customData: {},
      }],
      isTitleVisible: true,
      lineStyle: 'dashed',
      onDragEnd: () => onUpdateDrafts(this.getDraftPrices()),
      onClickCheck: async (datum) => {
        const { color } = datum;
        this.updateItem(datum.id as string, { color: 'var(--bs-grey)', opacity: 0.5 });
        try {
          await onClickDraftCheck(
            { ...this.getDraftPrices(), newClientOrderId: `from_draft_${Math.random()}` },
            datum.id === 'SELL' || datum.id === 'STOP_SELL' ? 'SELL' : 'BUY',
          );
          this.updateItem(datum.id as string, { color, opacity: 1 });
        } catch (e) {
          this.updateItem(datum.id as string, { color, opacity: 1 });

          throw e;
        }
      },
      onClickClose: (datum) => {
        this.updateItem(datum.id as string, { isVisible: false });
        onUpdateDrafts(this.getDraftPrices());
      },
      onUpdateItems,
    }, resizeData);

    this.#getPseudoPosition = getPseudoPosition;
    this.#calculateQuantity = calculateQuantity;
    this.#handleUpdateDrafts = onUpdateDrafts;
    this.#handleDoubleClick = onDoubleClick;
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
    lastPrice?: number;
    totalWalletBalance?: number;
    currentSymbolLeverage?: number;

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
    if (typeof data.lastPrice !== 'undefined') this.#lastPrice = data.lastPrice;
    if (typeof data.totalWalletBalance !== 'undefined') this.#totalWalletBalance = data.totalWalletBalance;
    if (typeof data.currentSymbolLeverage !== 'undefined') this.#currentSymbolLeverage = data.currentSymbolLeverage;

    if (typeof data.buyDraftPrice !== 'undefined') this.#buyDraftPrice = data.buyDraftPrice;
    if (typeof data.buyDraftSize !== 'undefined') this.#buyDraftSize = data.buyDraftSize;
    if (typeof data.sellDraftPrice !== 'undefined') this.#sellDraftPrice = data.sellDraftPrice;
    if (typeof data.sellDraftSize !== 'undefined') this.#sellDraftSize = data.sellDraftSize;

    if (typeof data.buyDraftPrice !== 'undefined' || typeof data.buyDraftSize !== 'undefined') {
      const currentSymbolPseudoPosition = this.#getPseudoPosition({ side: 'BUY' });
      const size = this.#buyDraftSize ? formatMoneyNumber(this.#buyDraftSize) : 0;
      const sizePercent = +(
        (((this.#buyDraftSize ?? 0) / this.#currentSymbolLeverage) / this.#totalWalletBalance) * 100
      ).toFixed(1);
      this.updateItem('BUY', {
        yValue: this.#buyDraftPrice ?? 0,
        title: `Draft ${size}$ (${sizePercent}%)`,
        customData: {
          draftAmount: currentSymbolPseudoPosition ? this.#calculateQuantity({
            symbol: currentSymbolPseudoPosition.symbol,
            size: this.#buyDraftSize ?? 0,
            price: this.#buyDraftPrice ?? 0,
          }) : 0,
        },
      });
    }

    if (typeof data.sellDraftPrice !== 'undefined' || typeof data.sellDraftSize !== 'undefined') {
      const currentSymbolPseudoPosition = this.#getPseudoPosition({ side: 'SELL' });
      const size = this.#sellDraftSize ? formatMoneyNumber(this.#sellDraftSize) : 0;
      const sizePercent = +(
        (
          ((this.#sellDraftSize ?? 0) / this.#currentSymbolLeverage) / this.#totalWalletBalance
        ) * 100
      ).toFixed(1);
      this.updateItem('SELL', {
        yValue: this.#sellDraftPrice ?? 0,
        title: `Draft ${size}$ (${sizePercent}%)`,
        customData: {
          draftAmount: currentSymbolPseudoPosition ? this.#calculateQuantity({
            symbol: currentSymbolPseudoPosition.symbol,
            size: this.#sellDraftSize ?? 0,
            price: this.#sellDraftPrice ?? 0,
          }) : 0,
        },
      });
    }

    if (typeof data.shouldShowBuyDraftPrice !== 'undefined') {
      this.updateItem('BUY', { isVisible: data.shouldShowBuyDraftPrice });
    }
    if (typeof data.shouldShowSellDraftPrice !== 'undefined') {
      this.updateItem('SELL', { isVisible: data.shouldShowSellDraftPrice });
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
    parent: SVGForeignObjectElement,
    eventsArea: SVGRectElement,
    resizeData: ResizeData,
    { wrapperCSSStyle }: { wrapperCSSStyle?: Partial<CSSStyleDeclaration> } = {},
  ): void => {
    super.appendTo(parent, eventsArea, resizeData, { wrapperCSSStyle });
    this.eventsArea
      ?.on('dblclick', (evt) => this.#onDoubleClick(d3.pointer(evt)))
      .on('mousedown', (evt: MouseEvent) => {
        if (evt.which === 2) this.#onDoubleClick(d3.pointer(evt));
      });

    let timeout: NodeJS.Timeout;
    let lastTap = 0;
    this.eventsArea?.on('touchend', (evt: TouchEvent & { target: SVGGElement; }) => {
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTap;
      clearTimeout(timeout);
      if (tapLength < 500 && tapLength > 0) {
        // calculate coordinates because d3.pointer(evt) doesn't work with touch events
        const { top, left } = evt.target.getBoundingClientRect();
        const { clientX, clientY } = evt.changedTouches[0];
        this.#onDoubleClick([clientX - left, clientY - top]);
        evt.preventDefault();
      } else {
        timeout = setTimeout(() => {
          clearTimeout(timeout);
        }, 500);
      }
      lastTap = currentTime;
    });
  };

  #onDoubleClick = (coords: [number, number]): void => {
    const yValue = this.invertY(coords[1]);
    const side: OrderSide = yValue < this.#lastPrice ? 'BUY' : 'SELL';

    this.updateItem(side, { yValue, isVisible: true });
    this.#handleUpdateDrafts(this.getDraftPrices());
    this.#handleDoubleClick();
  };
}
