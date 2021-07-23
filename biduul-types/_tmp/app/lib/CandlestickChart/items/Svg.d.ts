import { ChartItem, ResizeData } from '../types';
export default class Svg implements ChartItem {
    #private;
    appendTo: (parent: Element, resizeData: ResizeData) => SVGGElement;
    resize: ({ width, height, margin }: ResizeData) => void;
}
//# sourceMappingURL=Svg.d.ts.map