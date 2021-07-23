import { ReactElement } from 'react';
import * as api from '../../../../../../api';
interface Props {
    totalWalletBalance: number;
    availableBalance: number;
    price: number | null;
    side: api.OrderSide;
    percent?: number;
    isMax?: boolean;
    onOrder: (qty: number) => void;
}
declare const ButtonCol: ({ totalWalletBalance, availableBalance, price, side, percent, isMax, onOrder, }: Props) => ReactElement;
export default ButtonCol;
//# sourceMappingURL=ButtonCol.d.ts.map