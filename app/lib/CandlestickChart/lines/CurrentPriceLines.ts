import { ChartAxis, ResizeData } from '../types';
import PriceLines from './PriceLines';

interface Params {
  axis: ChartAxis;
}

export default class CurrentPriceLines extends PriceLines {
  constructor({ axis }: Params, resizeData: ResizeData) {
    super({
      axis,
      items: [{ id: 'currentPrice' }],
      color: 'var(--altamoon-chart-last-price-line-color)',
      pointerEventsNone: true,
    }, resizeData);
  }
}
