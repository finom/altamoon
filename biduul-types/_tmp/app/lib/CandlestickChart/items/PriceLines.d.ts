import { ChartAxis, ChartItem, PriceLinesDatum, ResizeData } from '../types';
declare type Handler = (datum: PriceLinesDatum, d: PriceLinesDatum[]) => void;
interface Params {
    items: PriceLinesDatum[];
    axis: ChartAxis;
    showX?: boolean;
    color?: string;
    isVisible?: boolean;
    isTitleVisible?: boolean;
    isBackgroundFill?: boolean;
    lineStyle?: 'solid' | 'dashed' | 'dotted';
    pointerEventsNone?: boolean;
    onDragEnd?: Handler;
    onAdd?: Handler;
    onRemove?: Handler;
    onClickClose?: Handler;
    onClickCheck?: Handler;
}
export default class PriceLines implements ChartItem {
    #private;
    constructor({ items, axis, showX, color, lineStyle, isTitleVisible, isBackgroundFill, pointerEventsNone, onDragEnd, onAdd, onRemove, onClickClose, onClickCheck, }: Params, resizeData: ResizeData);
    appendTo: (parent: Element, resizeData: ResizeData, { wrapperCSSStyle }?: {
        wrapperCSSStyle?: Partial<CSSStyleDeclaration> | undefined;
    }) => void;
    resize: (resizeData: ResizeData) => void;
    update(data?: {
        items?: PriceLinesDatum[];
        pricePrecision?: number;
    }): void;
    empty: () => void;
    updateItem: (key: number | string, data: PriceLinesDatum) => void;
    addItem: (data: PriceLinesDatum) => void;
    removeItem: (key: number | string) => void;
    invertX: (px: number) => Date;
    invertY: (px: number) => number;
    getItems: () => PriceLinesDatum[];
}
export {};
//# sourceMappingURL=PriceLines.d.ts.map