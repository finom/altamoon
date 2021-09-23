import { pick } from 'lodash';
import { TradingPosition } from '../../..';
import { ChartAxis, LiquidationLineSizeItem, ResizeData } from '../types';
import PriceLines from './PriceLines';
import { RootStore } from '../../../store';

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
}

const dataKeys: (keyof LiquidationPriceLinesData)[] = [
  'position', 'currentSymbolPseudoPosition', 'orderSizes', 'draftSizes',
];

export default class LiquidationPriceLines extends PriceLines {
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
      pointerEventsNone: true,
      isTitleVisible: true,
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

  #getWeightedArithmeticMean = (
    sizes: LiquidationLineSizeItem[],
  ): number => sizes.reduce((p, { price, amount }) => p + price * amount, 0)
    / sizes.reduce((p, { amount }) => p + amount, 0);

  #getLiquidationPrice = (side: 'BUY' | 'SELL'): number => {
    const { price, amount } = this.#getCombinedSize(side);
    const pseudoPosition = this.#getPseudoPosition({ side });

    if (!pseudoPosition) return 0;

    const {
      symbol, leverageBracket, marginType, leverage,
    } = pseudoPosition;

    const liqPrice = this.#calculateLiquidationPrice({
      symbol,
      entryPrice: price,
      leverageBracket,
      side,
      positionAmt: (side === 'BUY' ? 1 : -1) * amount,
      marginType,
      isolatedWallet: (price / leverage) * amount,
      leverage,
    }, { side });

    return liqPrice;
  };

  #getCombinedSize = (side: 'BUY' | 'SELL'): LiquidationLineSizeItem => {
    const data = this.#data;
    const sizes = this.sizes.filter((s) => s.side === side);

    if (data.position?.side === side) {
      sizes.push({
        side,
        price: data.position.entryPrice,
        amount: Math.abs(data.position.positionAmt),
      });
    }

    return {
      side,
      price: this.#getWeightedArithmeticMean(sizes) || 0,
      amount: sizes.reduce((p, { amount }) => p + amount, 0),
    };
  };
}
