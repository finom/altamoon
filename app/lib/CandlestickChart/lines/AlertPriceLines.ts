import * as d3 from 'd3';
import moment from 'moment';

import { ChartAxis, PriceLinesDatum, ResizeData } from '../types';
import PriceLines from './PriceLines';
import { alertUpUri, alertDownUri } from './alertSounds';

interface Params {
  axis: ChartAxis;
  alerts: number[];
  onUpdateAlerts: (d: number[]) => void;
}

interface CustomData {
  triggerTime?: number;
}

interface AlertLinesDatum extends PriceLinesDatum {
  customData: CustomData;
}

moment.relativeTimeThreshold('ss', 0);

const upSound = new Audio(alertUpUri);
const downSound = new Audio(alertDownUri);

export default class AlertPriceLines extends PriceLines {
  private static readonly color = '#828282' ;

  private static createAlertLine = (yValue: number): AlertLinesDatum => ({
    yValue,
    title: 'Alert',
    isDraggable: true,
    customData: {},
    color: this.color,
    id: yValue,
  });

  #lastPrice: number | null = null;

  #handleUpdate: Params['onUpdateAlerts'];

  constructor({ axis, alerts, onUpdateAlerts }: Params, resizeData: ResizeData) {
    super({
      axis,
      items: alerts.map(AlertPriceLines.createAlertLine),
      isTitleVisible: true,

      lineStyle: 'dashed',
      onDragEnd: () => this.#triggerUpdate(),
      onAdd: () => this.#triggerUpdate(),
      onRemove: () => this.#triggerUpdate(),
      onClickClose: (datum, d) => {
        this.removeItem(d.findIndex(({ yValue }) => datum.yValue === yValue));
      },
    }, resizeData);

    this.#handleUpdate = onUpdateAlerts;

    setInterval(() => {
      const items = this.#getTriggeredItems();
      const now = Date.now();

      for (const item of items) {
        const { triggerTime } = item.customData;
        const index = this.getItems().indexOf(item);
        if (triggerTime && triggerTime < now - 2 * 60_000) {
          this.removeItem(index);
        } else {
          this.updateItem(index, {
            title: `<span class="triggered-alert-indicator"></span> Alerted ${moment(triggerTime).fromNow()}`,
          });
        }
      }
    }, 1000);
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
        this.#triggerAlert(up, 'up');
      } else if (down) {
        this.#triggerAlert(down, 'down');
      }
    }

    this.#lastPrice = lastPrice;
  };

  public updateAlertLines = (alerts: number[]): void => {
    this.update({
      items: [
        ...alerts.map(AlertPriceLines.createAlertLine),
        ...this.#getTriggeredItems(),
      ],
    });
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

  public getItems(): AlertLinesDatum[] {
    return super.getItems() as AlertLinesDatum[];
  }

  #triggerUpdate = (): void => {
    this.#handleUpdate(this.#getActualItems().map(({ yValue }) => yValue ?? -1));
  };

  #onRightClick = (evt: MouseEvent): void => {
    evt.stopPropagation();
    evt.preventDefault();

    const coords = d3.pointer(evt);

    this.addItem(AlertPriceLines.createAlertLine(this.invertY(coords[1])));
  };

  #triggerAlert = (datum: AlertLinesDatum, direction: 'up' | 'down'): void => {
    if (datum.customData.triggerTime) return;
    const sound = direction === 'up' ? upSound : downSound;
    void sound.play();
    this.updateItem(this.getItems().indexOf(datum), {
      isDraggable: false,
      customData: { triggerTime: Date.now() },
    });

    this.#triggerUpdate();
  };

  #getActualItems = (): AlertLinesDatum[] => this.getItems()
    .filter(({ customData }) => !customData.triggerTime);

  #getTriggeredItems = (): AlertLinesDatum[] => this.getItems()
    .filter(({ customData }) => !!customData.triggerTime);
}
