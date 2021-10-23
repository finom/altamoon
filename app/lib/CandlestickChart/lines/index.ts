import DraftPriceLines from './DraftPriceLines';
import OrderPriceLines from './OrderPriceLines';
import AlertPriceLines from './AlertPriceLines';
import PositionPriceLines from './PositionPriceLines';
import CrosshairPriceLines from './CrosshairPriceLines';
import CustomPriceLines from './CustomPriceLines';
import {
  ChartAxis, DraftPrices, LiquidationLineSizeItem, PriceLinesDatum, ResizeData,
} from '../types';
import { OrderSide } from '../../../api';
import { RootStore } from '../../../store';
import CurrentPriceLines from './CurrentPriceLines';
import LiquidationPriceLines from './LiquidationPriceLines';
import { TradingOrder } from '../../../store/types';

interface Params {
  axis: ChartAxis;
  alerts: number[];
  calculateLiquidationPrice: RootStore['trading']['calculateLiquidationPrice'];
  calculateQuantity: RootStore['trading']['calculateQuantity'];
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

  public liquidationPriceLines: LiquidationPriceLines;

  constructor({
    axis, alerts, calculateLiquidationPrice, calculateQuantity, getPseudoPosition,
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
      calculateQuantity,
      onUpdateDrafts,
      onClickDraftCheck,
      onUpdateItems: (d) => {
        const items = d as PriceLinesDatum<{ draftAmount?: number }>[];
        const buyDatum = items.find(({ id }) => id === 'BUY');
        const sellDatum = items.find(({ id }) => id === 'SELL');
        const draftSizes: LiquidationLineSizeItem[] = [];

        if (buyDatum?.isVisible && buyDatum.customData?.draftAmount) {
          draftSizes.push({
            type: 'DRAFT_ORDER',
            side: 'BUY',
            amount: buyDatum.customData?.draftAmount,
            price: buyDatum.yValue ?? 0,
          });
        }

        if (sellDatum?.isVisible && sellDatum.customData?.draftAmount) {
          draftSizes.push({
            type: 'DRAFT_ORDER',
            side: 'SELL',
            amount: sellDatum.customData?.draftAmount,
            price: sellDatum.yValue ?? 0,
          });
        }

        this.liquidationPriceLines.updateLiquidationLines({ draftSizes });
      },
    }, resizeData);

    this.orderLines = new OrderPriceLines({
      axis,
      onDragLimitOrder,
      onCancelOrder,
      onUpdateItems: (d) => {
        const items = d as PriceLinesDatum<{ order?: TradingOrder }>[];
        const orderSizes: LiquidationLineSizeItem[] = items
          .filter((datum) => !!datum.customData?.order)
          .map(({ customData, yValue }) => ({
            type: 'ORDER',
            price: yValue ?? 0,
            amount: Math.abs(customData?.order?.origQty ?? 0),
            side: customData?.order?.side ?? 'BUY',
          }));

        this.liquidationPriceLines.updateLiquidationLines({ orderSizes });
      },
    }, resizeData);

    this.customLines = new CustomPriceLines({ axis }, resizeData);

    this.liquidationPriceLines = new LiquidationPriceLines({
      axis,
      getPseudoPosition,
      calculateLiquidationPrice,
    }, resizeData);
  }

  update(data?: { pricePrecision?: number }): void {
    this.currentPriceLines.update(data);
    this.crosshairPriceLines.update(data);
    this.alertLines.update(data);
    this.customLines.update(data);
    this.draftLines.update(data);
    this.positionLines.update(data);
    this.orderLines.update(data);
    this.liquidationPriceLines.update(data);
  }

  resize(resizeData: ResizeData): void {
    this.currentPriceLines.resize(resizeData);
    this.positionLines.resize(resizeData);
    this.orderLines.resize(resizeData);
    this.crosshairPriceLines.resize(resizeData);
    this.alertLines.resize(resizeData);
    this.draftLines.resize(resizeData);
    this.customLines.resize(resizeData);
    this.liquidationPriceLines.resize(resizeData);
  }

  appendTo(svgContainer: SVGGElement, resizeData: ResizeData): void {
    this.crosshairPriceLines.appendTo(svgContainer, resizeData);
    this.currentPriceLines.appendTo(svgContainer, resizeData);
    this.positionLines.appendTo(svgContainer, resizeData);
    this.orderLines.appendTo(svgContainer, resizeData);
    this.draftLines.appendTo(svgContainer, resizeData);
    this.alertLines.appendTo(svgContainer, resizeData);
    this.customLines.appendTo(svgContainer, resizeData);
    this.liquidationPriceLines.appendTo(svgContainer, resizeData);
  }
}
