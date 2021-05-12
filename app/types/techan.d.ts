declare module 'techan' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type TodoAny = any;
  // see https://github.com/andredumas/techan.js/blob/master/src/plot/plotmixin.js
  export interface PlotMixin<T = unknown> {
    xScale: (
      x: d3.ScaleContinuousNumeric<number, number> | d3.ScaleTime<number, number>
    ) => PlotMixin<T>;
    yScale: (
      y: d3.ScaleContinuousNumeric<number, number> | d3.ScaleTime<number, number>
    ) => PlotMixin<T>;
    orient: (f: string | ((d: T) => string)) => PlotMixin<T>;
    accessor: () => ({ d: (d: T) => number });
    on: (name: string, f: (d: T) => void) => PlotMixin<T>;
    xAnnotation: (arg: TodoAny) => PlotMixin<T>;
    yAnnotation: (arg: TodoAny) => PlotMixin<T>;
    axis: (arg: TodoAny) => PlotMixin<T>;
    format: (arg: TodoAny) => PlotMixin<T>;
    width: (arg: TodoAny) => PlotMixin<T>;
    translate: (arg: TodoAny) => PlotMixin<T>;
  }

  export interface ZoomableScale extends Omit<d3.ZoomScale, 'domain' | 'range' | 'copy' | 'clamp'> {
    domain: (d: unknown) => ZoomableScale;
    range: () => ZoomableScale;
    copy: () => ZoomableScale;
    clamp: (b: boolean) => ZoomableScale;
  }

  export interface FinancetimeScale extends d3.ScaleLinear<number, number, never> {
    zoomable: () => ZoomableScale;
  }

  export interface Techan {
    scale: {
      plot: { ohlc: (a: unknown, b: unknown) => ({ domain: () => number[] }) };
      financetime: () => ({
        range: (r: [number, number]) => FinancetimeScale;
      });
    }
    plot: {
      candlestick: <T>() => PlotMixin<T>;
      tradearrow: <T>() => PlotMixin<T>;
      crosshair: <T = unknown>() => PlotMixin<T>;
      axisannotation: <T = unknown>() => PlotMixin<T>;
    },
  }

  const techan: Techan;

  export default techan;
}
