import * as d3 from 'd3';
import { ChartItem, DrawData, Scales } from '../types';
export default class Plot implements ChartItem {
    #private;
    constructor({ scales }: {
        scales: Scales;
    });
    appendTo: (parent: Element) => void;
    draw: ({ candles }: DrawData) => void;
    resize(): void;
    update: (data: {
        scaledX?: d3.ScaleTime<number, number>;
    }) => void;
    private get bodyWidth();
    private get zoomScale();
    /**
   * Returns an array of smoothed candles.
   * (Based on heikin ashi candles, but keeps the real high & low)
   * */
    private static smoozCandles;
}
//# sourceMappingURL=Plot.d.ts.map