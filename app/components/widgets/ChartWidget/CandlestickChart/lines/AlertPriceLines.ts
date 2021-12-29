import * as d3 from 'd3';

import { ChartAxis, PriceLinesDatum, ResizeData } from '../types';
import PriceLines from './PriceLines';
import { alertUpSoundUri, alertDownSoundUri } from '../../../../../lib/alertSounds';

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

const upSound = new Audio(alertUpSoundUri);
const downSound = new Audio(alertDownSoundUri);

// https://icons.getbootstrap.com/icons/bell-fill/
const bellIconStr = `<svg style="transform: scale(0.7) translate(0, -3px);" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-bell" viewBox="0 0 16 16">
  <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zm.995-14.901a1 1 0 1 0-1.99 0A5.002 5.002 0 0 0 3 6c0 1.098-.5 6-2 7h14c-1.5-1-2-5.902-2-7 0-2.42-1.72-4.44-4.005-4.901z"/>
</svg>`;

let counter = 0;

export default class AlertPriceLines extends PriceLines {
  private static readonly color = '#828282';

  private static createAlertLine = (yValue: number): AlertLinesDatum => ({
    yValue,
    isTitleVisible: 'hover',
    title: bellIconStr,
    isDraggable: true,
    customData: {},
    color: this.color,
    // eslint-disable-next-line no-plusplus
    id: `alert_${new Date().toISOString()}_${counter++}`,
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
        if (triggerTime) {
          if (triggerTime < now - 2 * 60 * 60_000) {
            this.removeItem(index);
          } else {
            const diff = Date.now() - triggerTime;
            let msec = diff;
            const hh = Math.floor(msec / 1000 / 60 / 60);
            msec -= hh * 1000 * 60 * 60;
            const mm = Math.floor(msec / 1000 / 60);
            msec -= mm * 1000 * 60;
            const ss = Math.floor(msec / 1000);
            msec -= ss * 1000;

            this.updateItem(index, {
              isTitleVisible: true,
              title: `<span class="triggered-alert-indicator">${bellIconStr}</span> ${hh ? `${hh}h ` : ''}${mm ? `${mm}m ` : ''}${ss}s ago`,
            });
          }
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
