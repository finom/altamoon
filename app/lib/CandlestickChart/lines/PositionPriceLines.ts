import { TradingPosition } from '../../../store/types';
import { ChartAxis, ResizeData } from '../types';
import PriceLines from './PriceLines';

interface Params {
  axis: ChartAxis;
}

export default class PositionPriceLines extends PriceLines {
  constructor({ axis }: Params, resizeData: ResizeData) {
    super({
      axis,
      items: [{
        id: 'position', isVisible: false,
      }, {
        id: 'liquidation', isVisible: false, title: 'Pos. liquidation', isTitleVisible: false, color: 'var(--bs-red)',
      }],
      isTitleVisible: true,
      isBackgroundFill: true,
    }, resizeData);
  }

  public updatePositionLine = (position: TradingPosition | null): void => {
    if (position === null) {
      this.updateItem('position', { isVisible: false });
      this.updateItem('liquidation', { isVisible: false });
    } else {
      this.updateItem('position', {
        isVisible: true,
        yValue: position.entryPrice,
        color: position.side === 'BUY' ? '#30b332' : '#ab257c',
        title: `${position.positionAmt} ${position.baseAsset}`,
      });

      this.updateItem('liquidation', {
        isVisible: true,
        yValue: position.liquidationPrice,
        lineStyle: 'dashed',
      });
    }
  };
}
