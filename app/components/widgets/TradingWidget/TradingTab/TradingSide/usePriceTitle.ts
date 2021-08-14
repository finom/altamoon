import { useEffect } from 'react';
import formatBalanceMoneyNumber from '../../../../../lib/formatBalanceMoneyNumber';

interface Params {
  feeRate: number;
  totalWalletBalance: number;
  currentSymbolBaseAsset: string | null;
  leverage: number;
  size: number;
  price: number | null;
  quantity: number;
  setTitle: (title: string) => void;
}

export default function usePriceTitle({
  feeRate, totalWalletBalance, currentSymbolBaseAsset, leverage, size, price, quantity, setTitle,
}: Params): void {
  useEffect(() => {
    const margin = size / leverage;
    const fee = size * feeRate;
    const percentage = (n: number) => +((n / totalWalletBalance) * 100).toFixed(2);
    setTitle(price ? `
    ${formatBalanceMoneyNumber(quantity * price)}&nbsp;USDT<br>
    ${quantity}&nbsp;${currentSymbolBaseAsset ?? ''}<br>
    Est.&nbsp;margin&nbsp;= ${formatBalanceMoneyNumber(margin)}&nbsp;USDT (${percentage(margin)}%)<br>
    Est.&nbsp;fee&nbsp;= ${formatBalanceMoneyNumber(fee)}&nbsp;USDT (${percentage(fee)}%)
  ` : 'Unknown price');
  }, [
    totalWalletBalance, currentSymbolBaseAsset, leverage, size, price, quantity, setTitle, feeRate,
  ]);
}
