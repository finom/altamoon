import { ChartAxis, ResizeData } from '../types';
import PriceLines from './PriceLines';

interface Params {
  axis: ChartAxis;
}

export default class CustomPriceLines extends PriceLines {
  constructor({ axis }: Params, resizeData: ResizeData) {
    super({
      axis,
      items: [],
      isTitleVisible: true,
    }, resizeData);
  }
}
