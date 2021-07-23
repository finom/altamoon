import * as d3 from 'd3';
import { ChartItem, ResizeData, Scales } from '../types';
export default class GridLines implements ChartItem {
    #private;
    constructor({ scales }: {
        scales: Scales;
    });
    appendTo: (parent: Element, resizeData: ResizeData) => void;
    resize: ({ width, height }: ResizeData) => void;
    draw(): void;
    update: (data: {
        scaledX?: d3.ScaleTime<number, number>;
    }) => void;
}
//# sourceMappingURL=GridLines.d.ts.map