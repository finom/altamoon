import * as api from '../../api';

export type D3Selection<T extends d3.BaseType, C extends d3.BaseType = null>
  = d3.Selection<T, unknown, C, unknown>;

export interface StyleMargin {
  top: number; right: number; bottom: number; left: number;
}

export interface ChartPaddingPercents {
  top: number; right: number; bottom: number;
}

export interface ChartItem {
  appendTo: (parent: Element, resizeData: ResizeData) => void;
  resize: ({ width, height, margin }: ResizeData) => void
}

export interface Scales {
  x: d3.ScaleTime<number, number, never>;
  scaledX: d3.ScaleTime<number, number, never>;
  y: d3.ScaleLinear<number, number, never> | d3.ScaleSymLog<number, number, never>;
}

export interface ResizeData {
  width: number;
  height: number;
  margin: StyleMargin;
  scales: Scales;
}

export interface DrawData {
  candles: api.FuturesChartCandle[];
}

export interface SmoozCandle extends Omit<api.FuturesChartCandle, 'open' | 'close'> {
  direction: 'up' | 'down';
  open: number;
  close: number;
}

export interface LineData {
  text: string;
  value: string;
  color: string;
}

export interface PriceLinesDatum {
  xValue?: Date;
  yValue?: number;
  title?: string;
  color?: string;
  id?: string | number;
  isVisible?: boolean;
  isDraggable?: boolean;
  isCheckable?: boolean;
}

export interface ChartAxis {
  x: d3.Axis<d3.NumberValue>;
  yLeft: d3.Axis<d3.NumberValue>;
  yRight: d3.Axis<d3.NumberValue>;
}
