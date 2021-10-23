import { pick } from 'lodash';
import { TradingPosition } from '../../../store/types';
import { ChartAxis, LiquidationLineSizeItem, ResizeData } from '../types';
import PriceLines from './PriceLines';
import { RootStore } from '../../../store';
import * as api from '../../../api';

interface Params {
  axis: ChartAxis;
  calculateLiquidationPrice: RootStore['trading']['calculateLiquidationPrice'];
  getPseudoPosition: RootStore['trading']['getPseudoPosition'];
}

interface LiquidationPriceLinesData {
  position?: TradingPosition | null;
  currentSymbolPseudoPosition?: TradingPosition | null;
  orderSizes?: LiquidationLineSizeItem[];
  draftSizes?: LiquidationLineSizeItem[];
  leverageBrackets?: Record<string, api.FuturesLeverageBracket[]>
}

const dataKeys: (keyof LiquidationPriceLinesData)[] = [
  'position', 'currentSymbolPseudoPosition', 'orderSizes', 'draftSizes', 'leverageBrackets',
];

export default class LiquidationPriceLines extends PriceLines {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore TODO use calculateLiquidationPrice for calculation
  #calculateLiquidationPrice: Params['calculateLiquidationPrice'];

  #getPseudoPosition: Params['getPseudoPosition'];

  #data: LiquidationPriceLinesData = {
    orderSizes: [],
    draftSizes: [],
  };

  private get sizes(): LiquidationLineSizeItem[] {
    const data = this.#data;
    return [...(data.orderSizes ?? []), ...(data.draftSizes ?? [])];
  }

  constructor({
    axis, calculateLiquidationPrice, getPseudoPosition,
  }: Params, resizeData: ResizeData) {
    super({
      axis,
      items: [{
        id: 'BUY',
        isVisible: false,
        lineStyle: 'dashed',
        title: 'Buy liquidation',
      }, {
        id: 'SELL',
        isVisible: false,
        lineStyle: 'dashed',
        title: 'Sell liquidation',
      }],
      color: 'var(--bs-red)',
      isTitleVisible: 'hover',
    }, resizeData);

    this.#calculateLiquidationPrice = calculateLiquidationPrice;
    this.#getPseudoPosition = getPseudoPosition;
  }

  public updateLiquidationLines = (linesData: LiquidationPriceLinesData): void => {
    Object.assign(this.#data, pick(linesData, dataKeys));
    const { sizes } = this;

    const isBuyVisible = !!sizes.filter((o) => o.side === 'BUY').length;
    const isSellVisible = !!sizes.filter((o) => o.side === 'SELL').length;

    this.updateItem('BUY', {
      isVisible: isBuyVisible,
      yValue: isBuyVisible ? this.#getLiquidationPrice('BUY') : 0,
    });

    this.updateItem('SELL', {
      isVisible: isSellVisible,
      yValue: isSellVisible ? this.#getLiquidationPrice('SELL') : 0,
    });
  };

  // calculation code is borrowed from there https://github.com/Letiliel/biduul/blob/no-book/js/data/liquidation.js#L41
  #getLiquidationPrice = (side: 'BUY' | 'SELL'): number => {
    const pseudoPosition = this.#getPseudoPosition({ side });
    const data = this.#data;
    const sizes = this.sizes.filter((s) => s.side === side);
    const direction = side === 'BUY' ? 1 : -1;

    if (!pseudoPosition) return 0;

    if (data.position?.side === side) {
      sizes.push({
        type: 'POSITION',
        side,
        price: data.position.entryPrice,
        amount: Math.abs(data.position.positionAmt),
      });
    }

    sizes.sort((a, b) => (a.price > b.price ? -direction : direction));

    const { symbol, leverage } = pseudoPosition;

    const leverageBrackets = this.#data.leverageBrackets?.[symbol];

    if (!leverageBrackets) return 0;

    const total = { margin: 0, averagePrice: 0, amount: 0 };
    let liquidation = 0;

    /**
     * Add up items one by one, (re)calculate liquidation for each,
     * stop when current item is out of last liquidation price
     * */
    for (const size of sizes) {
      if (liquidation && direction * size.price <= liquidation * direction) break;

      const weightedTotalPrice = size.price * size.amount + total.averagePrice * total.amount;
      const totalAmt = size.amount + total.amount;

      total.averagePrice = weightedTotalPrice / totalAmt;
      total.margin += (size.amount * size.price) / leverage;
      total.amount = totalAmt;

      const positionValue = direction * total.amount * total.averagePrice;

      const leverageBracket = leverageBrackets.find(
        ({ notionalCap }) => notionalCap > total.amount * total.averagePrice,
      ) ?? leverageBrackets[0];

      liquidation = (total.margin + leverageBracket?.cum - positionValue)
                      / (total.amount * (leverageBracket?.maintMarginRatio - direction));
    }

    return liquidation;
  };
}
