import * as d3 from 'd3';
import { format } from 'd3';
import * as api from '../../../../../api';
import { TradingOrder, TradingPosition } from '../../../../../store/types';
import { D3Selection, ResizeData, Scales } from '../types';

const nFormat = (f: string, n: number) => format(f)(n);

export default class Measurer {
  #container?: D3Selection<SVGGElement>;

  #wrapper?: D3Selection<SVGGElement>;

  #rect?: D3Selection<SVGRectElement>;

  #labelContainer?: D3Selection<SVGForeignObjectElement>;

  #labelWrapper?: D3Selection<HTMLDivElement>;

  #label?: D3Selection<HTMLDivElement>;

  #scales: Scales;

  #drawing = false;

  #start: { x: Date; y: number; } | null = null;

  #end: { x: Date; y: number; } | null = null;

  #resizeData: ResizeData;

  #position: TradingPosition | null = null;

  #orders: TradingOrder[] = [];

  #totalWalletBalance = 0;

  #currentSymbolLeverage = 1;

  constructor({ scales, resizeData }: { scales: Scales; resizeData: ResizeData; }) {
    this.#scales = scales;
    this.#resizeData = resizeData;
  }

  public appendTo = (parent: SVGGElement, resizeData: ResizeData): void => {
    this.#resizeData = resizeData;

    const container = d3.select(parent);
    this.#container = container as D3Selection<SVGGElement>;
    this.#wrapper = container.append('g')
      .attr('class', 'measurer')
      .attr('clip-path', 'url(#clipChart)')
      .attr('display', 'none');

    this.#rect = this.#wrapper.append('rect');

    this.#labelContainer = this.#wrapper.append('foreignObject');
    this.#labelWrapper = this.#labelContainer.append('xhtml:div');
    this.#labelWrapper.property('className', 'measurer-label');
    this.#label = this.#labelWrapper.append('xhtml:div');

    container
      .on('click.measurer', this.#onContainerClick)
      .on('mousemove.measurer', this.#drawMeasurer);
  };

  public draw = ({ x, y, resizeData }: { x: number; y: number; resizeData: ResizeData; }): void => {
    this.#wrapper?.attr('display', 'visible');

    // Store chart-space coords for start and end points
    this.#end = {
      x: this.#scales.scaledX.invert(x),
      y: this.#scales.y.invert(y),
    };
    this.#start = this.#start || this.#end;

    this.resize(resizeData);
  };

  public resize = (resizeData: ResizeData): void => {
    if (this.#wrapper?.attr('display') === 'none' || !this.#start || !this.#end) return;

    this.#resizeData = resizeData;

    // Get pixel coords for start and end points
    const start = {
      x: this.#scales.scaledX(this.#start.x),
      y: this.#scales.y(this.#start.y),
    };
    const end = {
      x: this.#scales.scaledX(this.#end.x),
      y: this.#scales.y(this.#end.y),
    };

    const x = Math.min(start.x, end.x);
    const y = Math.min(start.y, end.y);

    const width = Math.abs(end.x - start.x);
    const height = Math.abs(end.y - start.y);

    this.#drawRect(x, y, width, height);
    this.#drawLabel(x, end.y, width);
  };

  #drawRect(x: number, y: number, width: number, height: number): void {
    this.#rect
      ?.attr('x', x)
      .attr('y', y)
      .attr('width', width)
      .attr('height', height);
  }

  #drawLabel(x: number, y: number, rectWidth: number): void {
    if (!this.#label || !this.#end || !this.#start) return;
    this.#drawLabelText();

    const yDirection = (this.#end.y >= this.#start.y) ? 1 : 0;

    const { width, height } = this.#label.node()?.getBoundingClientRect()
      ?? { width: 0, height: 0 };
    const margin = 8;

    // Keep within svg bounds
    if (x + width > this.#resizeData.width) {
      // eslint-disable-next-line no-param-reassign
      x = this.#resizeData.width - width;
    }

    // y
    if (yDirection) {
      // eslint-disable-next-line no-param-reassign
      y = y - height - margin;
      // eslint-disable-next-line no-param-reassign
      if (y < 0) y = 0; // Keep within svg bounds
    } else {
      // eslint-disable-next-line no-param-reassign
      y += margin;
      if (y + height > this.#resizeData.height) {
        // eslint-disable-next-line no-param-reassign
        y = this.#resizeData.height - height;
      }
    }

    // Go place it
    this.#labelContainer?.attr('x', x).attr('y', y);

    this.#labelWrapper?.style('width', `${rectWidth}px`);
  }

  #drawLabelText(): void {
    if (!this.#end || !this.#start) return;
    const { x: x1, y: y1 } = this.#start;
    const { x: x2, y: y2 } = this.#end;

    const time = Measurer.getTimeInterval(Math.abs(+x2 - +x1));

    const amount = y2 - y1;

    const percentage = (y2 - y1) / y1;

    const leveragedPercent = ((y2 - y1) / y1) * this.#currentSymbolLeverage;
    const trueLeverage = this.#position && this.#totalWalletBalance
      ? this.#position.baseValue / this.#totalWalletBalance : 0;

    const trueLeveragedPercent = ((y2 - y1) / y1) * trueLeverage;

    const side: api.OrderSide = (y2 >= y1) ? 'BUY' : 'SELL';

    const orderQty = this.#orders
      .reduce((a, order) => a + (order.side === side ? order.origQty : 0), 0);
    const orderValue = orderQty * y1;

    const orderLeverage = this.#totalWalletBalance ? orderValue / this.#totalWalletBalance : 0;
    const orderLeveragedPercent = ((y2 - y1) / y1) * orderLeverage;

    this.#label?.html(`
      <p><b>${time}</b></p>
      <p><b>${nFormat(',.2f', amount)}</b> USDT</p>
      <p><b>${nFormat('+,.2%', percentage)}</b></p>
      <p><b>${nFormat('+,.1%', leveragedPercent)}</b> at ${this.#currentSymbolLeverage}x</p>
      <p><b>${nFormat('+,.1%', trueLeveragedPercent)}</b> at ${Measurer.formatLeverage(trueLeverage)}x (position)</p>
      <p><b>${nFormat('+,.1%', orderLeveragedPercent)}</b> at ${Measurer.formatLeverage(orderLeverage)}x (${side.toLowerCase()} qty)</p>
    `);
  }

  public update = (data: {
    position?: TradingPosition | null;
    orders?: TradingOrder[];
    totalWalletBalance?: number;
    currentSymbolLeverage?: number;
  }): void => {
    if (typeof data.position !== 'undefined') {
      this.#position = data.position;
    }

    if (typeof data.orders !== 'undefined') {
      this.#orders = data.orders;
    }

    if (typeof data.totalWalletBalance !== 'undefined') {
      this.#totalWalletBalance = data.totalWalletBalance;
    }

    if (typeof data.currentSymbolLeverage !== 'undefined') {
      this.#currentSymbolLeverage = data.currentSymbolLeverage;
    }

    this.#drawLabelText();
  };

  #onContainerClick = (evt: MouseEvent): void => {
    const hidden = this.#wrapper?.attr('display') === 'none';
    if (evt.shiftKey) {
      if (this.#drawing) {
        this.#drawing = false;
      } else {
        this.#drawing = true;
        this.#start = null;
        this.#drawMeasurer(evt);
      }
    } else if (this.#drawing) {
      this.#drawing = false;
    } else if (!hidden) {
      this.#wrapper?.attr('display', 'none'); // hide
    }
  };

  #drawMeasurer = (evt: MouseEvent): void => {
    if (!this.#drawing) return;

    const coords = d3.pointer(evt, this.#container?.node());

    this.draw({ x: coords[0], y: coords[1], resizeData: this.#resizeData });
  };

  private static getTimeInterval(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const totalHours = Math.floor(totalMinutes / 60);
    const days = Math.floor(totalHours / 24);

    const minutes = totalMinutes % 60;
    const hours = totalHours % 24;

    return (days ? `${days}d ` : '')
        + (hours ? `${hours}h ` : '')
        + (minutes ? `${minutes}m` : '');
  }

  private static formatLeverage(leverage: number): string {
    return (leverage < 10)
      ? nFormat('.1~f', leverage)
      : nFormat('d', leverage);
  }
}
