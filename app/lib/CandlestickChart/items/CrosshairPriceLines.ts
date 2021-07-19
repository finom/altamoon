import { ChartAxis, ResizeData } from '../types';
import PriceLines from './PriceLines';

interface Params {
  axis: ChartAxis;
}

export default class CrosshairPriceLines extends PriceLines {
  constructor({ axis }: Params, resizeData: ResizeData) {
    super({
      axis,
      items: [{ id: 'crosshair', isVisible: false }],
      showX: true,
      color: '#3F51B5',
      lineStyle: 'dotted',
      pointerEventsNone: true,
    }, resizeData);
  }

  public show = (x: number, y: number): void => {
    this.updateItem('crosshair', {
      isVisible: true,
      xValue: this.invertX(x),
      yValue: this.invertY(y),
    });
  };

  public hide = (): void => {
    this.updateItem('crosshair', { isVisible: false });
  };
}
