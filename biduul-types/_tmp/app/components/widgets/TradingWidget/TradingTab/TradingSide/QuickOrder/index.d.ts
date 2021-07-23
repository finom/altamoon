import { ReactElement } from 'react';
import * as api from '../../../../../../api';
interface Props {
    totalWalletBalance: number;
    availableBalance: number;
    price: number | null;
    side: api.OrderSide;
    onOrder: (qty: number) => void;
}
declare const QuickOrder: ({ totalWalletBalance, availableBalance, price, side, onOrder, }: Props) => ReactElement;
export default QuickOrder;
//# sourceMappingURL=index.d.ts.map