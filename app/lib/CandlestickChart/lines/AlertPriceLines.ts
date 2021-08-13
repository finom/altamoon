import * as d3 from 'd3';
import { ChartAxis, ResizeData } from '../types';
import PriceLines from './PriceLines';

interface Params {
  axis: ChartAxis;
  alerts: number[];
  onUpdateAlerts: (d: number[]) => void;
}

export default class AlertPriceLines extends PriceLines {
  #lastPrice: number | null = null;

  constructor({ axis, alerts, onUpdateAlerts }: Params, resizeData: ResizeData) {
    super({
      axis,
      items: alerts.map((yValue) => ({ yValue, title: 'Alert', isDraggable: true })),
      color: '#828282',
      isTitleVisible: true,
      lineStyle: 'dashed',
      onDragEnd: () => onUpdateAlerts?.(this.getItems().map(({ yValue }) => yValue ?? -1)),
      onAdd: () => onUpdateAlerts?.(this.getItems().map(({ yValue }) => yValue ?? -1)),
      onRemove: () => onUpdateAlerts?.(this.getItems().map(({ yValue }) => yValue ?? -1)),
      onClickClose: (datum, d) => {
        this.removeItem(d.findIndex(({ yValue }) => datum.yValue === yValue));
      },
    }, resizeData);
  }

  public checkAlerts = (lastPrice: number): void => {
    const previousLastPrice = this.#lastPrice;
    const items = this.getItems();

    if (lastPrice && previousLastPrice) {
      const up = items.find(
        ({ yValue }) => yValue && lastPrice >= yValue && previousLastPrice < yValue,
      );
      const down = items.find(
        ({ yValue }) => yValue && lastPrice <= yValue && previousLastPrice > yValue,
      );
      if (up) {
        void new Audio('../assets/audio/alert-up.mp3').play();
        this.removeItem(items.indexOf(up));
      } else if (down) {
        void new Audio('../assets/audio/alert-down.mp3').play();
        this.removeItem(items.indexOf(down));
      }
    }

    this.#lastPrice = lastPrice;
  };

  public updateAlertLines = (alerts: number[]): void => {
    this.update({ items: alerts.map((yValue) => ({ yValue, title: 'Alert', isDraggable: true })) });
  };

  public update = (data: Parameters<PriceLines['update']>[0] & { lastPrice?: number } = {}): void => {
    super.update(data);
    if (typeof data.lastPrice === 'number') {
      this.#lastPrice = data.lastPrice;
    }
  };

  public appendTo = (
    parent: Element,
    resizeData: ResizeData,
    { wrapperCSSStyle }: { wrapperCSSStyle?: Partial<CSSStyleDeclaration> } = {},
  ): void => {
    super.appendTo(parent, resizeData, { wrapperCSSStyle });
    this.eventsArea?.on('contextmenu', this.#onRightClick);
  };

  #onRightClick = (evt: MouseEvent): void => {
    evt.stopPropagation();
    evt.preventDefault();

    const coords = d3.pointer(evt);

    this.addItem({
      yValue: this.invertY(coords[1]),
      title: 'Alert',
      isDraggable: true,
    });
  };
}
