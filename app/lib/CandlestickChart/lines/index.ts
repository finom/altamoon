import DraftPriceLines from './DraftPriceLines';
import OrderPriceLines from './OrderPriceLines';
import AlertPriceLines from './AlertPriceLines';
import PositionPriceLines from './PositionPriceLines';
import CrosshairPriceLines from './CrosshairPriceLines';
import CustomPriceLines from './CustomPriceLines';
import { ChartAxis, DraftPrices, ResizeData } from '../types';
import { OrderSide } from '../../../api';
import { RootStore } from '../../../store';
import CurrentPriceLines from './CurrentPriceLines';

interface Params {
  axis: ChartAxis;
  alerts: number[];
  calculateLiquidationPrice: RootStore['trading']['calculateLiquidationPrice'];
  getPseudoPosition: RootStore['trading']['getPseudoPosition'];
  onUpdateAlerts: (d: number[]) => void;
  onUpdateDrafts: (d: DraftPrices) => void;
  onClickDraftCheck: (d: DraftPrices, side: OrderSide) => void;
  onDragLimitOrder: (orderId: number, price: number) => void;
  onCancelOrder: (orderId: number) => void;
}

export default class Lines {
  public currentPriceLines: CurrentPriceLines;

  public crosshairPriceLines: CrosshairPriceLines;

  public alertLines: AlertPriceLines;

  public positionLines: PositionPriceLines;

  public orderLines: OrderPriceLines;

  public draftLines: DraftPriceLines;

  public customLines: CustomPriceLines;

  constructor({
    axis, alerts, calculateLiquidationPrice, getPseudoPosition,
    onUpdateAlerts, onUpdateDrafts, onClickDraftCheck, onDragLimitOrder, onCancelOrder,
  }: Params, resizeData: ResizeData) {
    this.crosshairPriceLines = new CrosshairPriceLines({ axis }, resizeData);

    this.currentPriceLines = new CurrentPriceLines({ axis }, resizeData);

    this.alertLines = new AlertPriceLines({
      axis,
      alerts,
      onUpdateAlerts,
    }, resizeData);

    this.positionLines = new PositionPriceLines({ axis }, resizeData);

    this.draftLines = new DraftPriceLines({
      axis,
      getPseudoPosition,
      onUpdateDrafts,
      onClickDraftCheck,
    }, resizeData);

    this.orderLines = new OrderPriceLines({
      axis,
      calculateLiquidationPrice,
      onDragLimitOrder,
      onCancelOrder,
    }, resizeData);

    this.customLines = new CustomPriceLines({ axis }, resizeData);
  }

  update(data?: { pricePrecision?: number }): void {
    this.currentPriceLines.update(data);
    this.crosshairPriceLines.update(data);
    this.alertLines.update(data);
    this.customLines.update(data);
    this.draftLines.update(data);
    this.positionLines.update(data);
    this.orderLines.update(data);
  }

  resize(resizeData: ResizeData): void {
    this.currentPriceLines.resize(resizeData);
    this.positionLines.resize(resizeData);
    this.orderLines.resize(resizeData);
    this.crosshairPriceLines.resize(resizeData);
    this.alertLines.resize(resizeData);
    this.draftLines.resize(resizeData);
    this.customLines.resize(resizeData);
  }

  appendTo(svgContainer: SVGGElement, resizeData: ResizeData): void {
    this.crosshairPriceLines.appendTo(svgContainer, resizeData);
    this.currentPriceLines.appendTo(svgContainer, resizeData);
    this.positionLines.appendTo(svgContainer, resizeData);
    this.orderLines.appendTo(svgContainer, resizeData);
    this.draftLines.appendTo(svgContainer, resizeData);
    this.alertLines.appendTo(svgContainer, resizeData);
    this.customLines.appendTo(svgContainer, resizeData);
  }
}
