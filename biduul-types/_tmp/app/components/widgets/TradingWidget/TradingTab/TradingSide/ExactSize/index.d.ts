import { ReactElement } from 'react';
import * as api from '../../../../../../api';
interface Props {
    side: api.OrderSide;
    totalWalletBalance: number;
    availableBalance: number;
    price: number | null;
    id: string;
    exactSizeStr: string;
    setExactSizeStr: (value: string) => void;
    onOrder: (qty: number) => void;
}
declare const ExactSize: ({ side, totalWalletBalance, availableBalance, price, id, onOrder, exactSizeStr, setExactSizeStr, }: Props) => ReactElement;
export default ExactSize;
//# sourceMappingURL=index.d.ts.map