import { OrderSide } from '../../../api';
import { ChartAxis, ResizeData } from '../types';
import PriceLines from './PriceLines';
export default class DraftPriceLines extends PriceLines {
    constructor({ axis, onUpdateDrafts, onClickDraftCheck }: {
        axis: ChartAxis;
        onUpdateDrafts: ((r: {
            buyDraftPrice: number | null;
            sellDraftPrice: number | null;
            stopBuyDraftPrice: number | null;
            stopSellDraftPrice: number | null;
        }) => void);
        onClickDraftCheck: ((r: {
            buyDraftPrice: number | null;
            sellDraftPrice: number | null;
            stopBuyDraftPrice: number | null;
            stopSellDraftPrice: number | null;
        }, side: OrderSide) => void);
    }, resizeData: ResizeData);
    getDraftPrices: () => {
        buyDraftPrice: number | null;
        sellDraftPrice: number | null;
        stopBuyDraftPrice: number | null;
        stopSellDraftPrice: number | null;
    };
}
//# sourceMappingURL=DraftPriceLines.d.ts.map