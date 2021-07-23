import React, { ReactNode } from 'react';
import * as api from '../../../../../api';
interface Props {
    side: api.OrderSide;
    reduceOnly: boolean;
    postOnly: boolean;
    price: number | null;
    stopPrice: number | null;
    id: string;
    tradingType: api.OrderType;
    exactSizeStr: string;
    setExactSizeStr: (value: string) => void;
    children?: ReactNode;
}
declare const _default: React.MemoExoticComponent<({ side, reduceOnly, postOnly, price, stopPrice, id, tradingType, children, exactSizeStr, setExactSizeStr, }: Props) => React.ReactElement<any, string | React.JSXElementConstructor<any>>>;
export default _default;
//# sourceMappingURL=index.d.ts.map