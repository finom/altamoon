import { ChartAxis, ResizeData } from '../types';
import PriceLines from './PriceLines';

interface Params {
  axis: ChartAxis;
}

export default class CurrentPriceLines extends PriceLines {
  constructor({ axis }: Params, resizeData: ResizeData) {
    super({
      axis,
      items: [
        { id: 'lastPrice' },
        { id: 'bidPrice', isVisible: false, isPriceLabelVisible: false },
        { id: 'askPrice', isVisible: false, isPriceLabelVisible: false },
      ],
      color: 'var(--altamoon-chart-last-price-line-color)',
      pointerEventsNone: true,
    }, resizeData);
  }

  updateCurrentPrices = (data: {
    lastPrice?: number;
    shouldShowBidAskLines?: boolean;
    bids?: [number, number][];
    asks?: [number, number][];
  }) => {
    if (typeof data.shouldShowBidAskLines !== 'undefined') {
      this.updateItem('lastPrice', {
        lineStyle: data.shouldShowBidAskLines ? 'none' : 'solid',
      });
      this.updateItem('bidPrice', { isVisible: data.shouldShowBidAskLines });
      this.updateItem('askPrice', { isVisible: data.shouldShowBidAskLines });
    }

    if (typeof data.lastPrice !== 'undefined') {
      this.updateItem('lastPrice', { yValue: data.lastPrice });
    }

    if (typeof data.bids !== 'undefined') {
      this.updateItem('bidPrice', { yValue: data.bids[0]?.[0] ?? 0 });
    }

    if (typeof data.asks !== 'undefined') {
      this.updateItem('askPrice', { yValue: data.asks[0]?.[0] ?? 0 });
    }
  };
}
