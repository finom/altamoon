import { ReactElement } from 'react';
interface Props {
    id: string;
    value: string;
    side: 'BUY' | 'SELL' | 'STOP_BUY' | 'STOP_SELL';
    shouldShowPriceLine: boolean;
    onChangeShouldShowPriceLine: (v: boolean) => void;
    onChange: (v: string) => void;
}
declare const TradingPriceInput: ({ id, value, side, shouldShowPriceLine, onChangeShouldShowPriceLine, onChange, }: Props) => ReactElement;
export default TradingPriceInput;
//# sourceMappingURL=index.d.ts.map