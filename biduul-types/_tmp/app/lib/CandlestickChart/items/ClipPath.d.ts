import { ChartItem, ResizeData } from '../types';
export default class ClipPath implements ChartItem {
    #private;
    appendTo: (parent: Element, resizeData: ResizeData) => void;
    resize: ({ width, height }: ResizeData) => void;
}
//# sourceMappingURL=ClipPath.d.ts.map