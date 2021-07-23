import { Dispatch, SetStateAction } from 'react';
export default function useDraftPrice(priceKey: 'limitBuyPrice' | 'limitSellPrice' | 'stopBuyPrice' | 'stopSellPrice', shouldShowKey: 'shouldShowLimitBuyPriceLine' | 'shouldShowLimitSellPriceLine' | 'shouldShowStopBuyPriceLine' | 'shouldShowStopSellPriceLine', { pricePrecision }: {
    pricePrecision: number;
}): {
    shouldShowPriceLine: boolean;
    setShouldShowPriceLine: (value: boolean | ((value: boolean) => boolean)) => void;
    priceStr: string;
    setPriceStr: Dispatch<SetStateAction<string>>;
    price: number | null;
};
//# sourceMappingURL=useDraftPrice.d.ts.map