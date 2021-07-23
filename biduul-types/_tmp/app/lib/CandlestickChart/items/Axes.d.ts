import * as d3 from 'd3';
import { ChartItem, ResizeData, Scales } from '../types';
export default class Axes implements ChartItem {
    #private;
    constructor({ scales }: {
        scales: Scales;
    });
    getAxis: () => {
        x: d3.Axis<d3.NumberValue>;
        yLeft: d3.Axis<d3.NumberValue>;
        yRight: d3.Axis<d3.NumberValue>;
    };
    appendTo: (parent: Element, resizeData: ResizeData) => void;
    draw({ scales }: ResizeData): void;
    resize: (resizeData: ResizeData) => void;
    update: (data: {
        pricePrecision?: number;
        scaledX?: d3.ScaleTime<number, number>;
    }) => void;
}
//# sourceMappingURL=Axes.d.ts.map