import { ReactNode, ReactElement } from 'react';
import * as api from '../../../../api';
interface Props {
    isWideLayout: boolean;
    postOnly: boolean;
    reduceOnly: boolean;
    buyPrice: number | null;
    sellPrice: number | null;
    stopBuyPrice: number | null;
    stopSellPrice: number | null;
    id: string;
    buyNode?: ReactNode;
    sellNode?: ReactNode;
    tradingType: api.OrderType;
    exactSizeBuyStr: string;
    setExactSizeBuyStr: (value: string) => void;
    exactSizeSellStr: string;
    setExactSizeSellStr: (value: string) => void;
}
declare const TradingTab: ({ isWideLayout, postOnly, reduceOnly, buyPrice, sellPrice, stopBuyPrice, stopSellPrice, id, buyNode, sellNode, tradingType, exactSizeBuyStr, setExactSizeBuyStr, exactSizeSellStr, setExactSizeSellStr, }: Props) => ReactElement;
export default TradingTab;
//# sourceMappingURL=index.d.ts.map