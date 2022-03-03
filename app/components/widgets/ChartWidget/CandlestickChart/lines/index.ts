import * as d3 from 'd3';
import DraftPriceLines from './DraftPriceLines';
import OrderPriceLines from './OrderPriceLines';
import AlertPriceLines from './AlertPriceLines';
import PositionPriceLines from './PositionPriceLines';
import CrosshairPriceLines from './CrosshairPriceLines';
import CustomPriceLines from './CustomPriceLines';
import {
  AlertItem,
  ChartAxis, DraftPrices, LiquidationLineSizeItem, PriceLinesDatum, ResizeData,
} from '../types';
import { OrderSide } from '../../../../../api';
import { RootStore } from '../../../../../store';
import CurrentPriceLines from './CurrentPriceLines';
import LiquidationPriceLines from './LiquidationPriceLines';
import { TradingOrder } from '../../../../../store/types';

interface Params {
  axis: ChartAxis;
  calculateLiquidationPrice: RootStore['trading']['calculateLiquidationPrice'];
  calculateQuantity: RootStore['trading']['calculateQuantity'];
  getPseudoPosition: RootStore['trading']['getPseudoPosition'];
  onUpdateAlerts: (d: AlertItem[]) => void;
  onUpdateDrafts: (d: DraftPrices) => void;
  onDoubleClick: () => void;
  onClickDraftCheck: (
    d: DraftPrices & { newClientOrderId: string; },
    side: OrderSide,
  ) => Promise<void>;
  onDragLimitOrder: (clientOrderId: string, price: number) => void | Promise<void>;
  onCancelOrder: (clientOrderId: string) => void | Promise<void>;
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
    axis, calculateLiquidationPrice, calculateQuantity, getPseudoPosition, onDoubleClick,
    onUpdateAlerts, onUpdateDrafts, onClickDraftCheck, onDragLimitOrder, onCancelOrder,
  }: Params, resizeData: ResizeData) {
    this.crosshairPriceLines = new CrosshairPriceLines({ axis }, resizeData);

    this.currentPriceLines = new CurrentPriceLines({ axis }, resizeData);

    this.alertLines = new AlertPriceLines({
      axis,
      onUpdateAlerts,
    }, resizeData);

    this.positionLines = new PositionPriceLines({ axis }, resizeData);

    this.draftLines = new DraftPriceLines({
      axis,
      getPseudoPosition,
      calculateQuantity,
      onUpdateDrafts,
      onDoubleClick,
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
    const container = d3.select(svgContainer).append('foreignObject')
      .attr('height', '100%')
      .attr('width', '100%')
      .style('pointer-events', 'none')
      .node() as SVGForeignObjectElement;

    const eventsArea = d3.select(svgContainer).select<SVGRectElement>('#plotMouseEventsArea').node() as SVGRectElement;
    this.crosshairPriceLines.appendTo(container, eventsArea, resizeData);
    this.currentPriceLines.appendTo(container, eventsArea, resizeData);
    this.positionLines.appendTo(container, eventsArea, resizeData);
    this.orderLines.appendTo(container, eventsArea, resizeData);
    this.draftLines.appendTo(container, eventsArea, resizeData);
    this.alertLines.appendTo(container, eventsArea, resizeData);
    this.customLines.appendTo(container, eventsArea, resizeData);
    this.liquidationPriceLines.appendTo(container, eventsArea, resizeData);
  }
}
