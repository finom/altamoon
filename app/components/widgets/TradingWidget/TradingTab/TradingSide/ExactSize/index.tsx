import { capitalize } from 'lodash';
import React, {
  ReactElement, Ref, useEffect, useMemo,
} from 'react';
import { Button } from 'reactstrap';
import { useSilent, useValue } from 'use-change';

import * as api from '../../../../../../api';
import useBootstrapTooltip from '../../../../../../hooks/useBootstrapTooltip';
import formatBalanceMoneyNumber from '../../../../../../lib/formatBalanceMoneyNumber';
import { MARKET, PERSISTENT, TRADING } from '../../../../../../store';
import LabeledInput from '../../../../../controls/LabeledInput';
import PercentSelector from './PercentSelector';

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

const tooltipOptions = {
  offset: '0, 6',
};

const ExactSize = ({
  side,
  totalWalletBalance,
  availableBalance,
  price,
  id,
  onOrder,
  exactSizeStr,
  setExactSizeStr,
}: Props): ReactElement => {
  const calculateQuantity = useSilent(TRADING, 'calculateQuantity');
  const calculateSizeFromString = useSilent(TRADING, 'calculateSizeFromString');
  const symbol = useValue(PERSISTENT, 'symbol');
  const leverage = +useValue(TRADING, 'allSymbolsPositionRisk')[symbol]?.leverage || 1;

  const exactSize = useMemo(
    () => calculateSizeFromString(symbol, exactSizeStr),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [calculateSizeFromString, exactSizeStr, symbol, totalWalletBalance, leverage],
  );

  const quantity = useMemo(() => {
    if (typeof price !== 'number') return 0;

    return calculateQuantity({
      symbol,
      price,
      size: exactSize,
    });
  }, [calculateQuantity, exactSize, price, symbol]);

  const [inputRef, setInputTitle] = useBootstrapTooltip<HTMLInputElement>(tooltipOptions);
  const currentSymbolBaseAsset = useValue(MARKET, 'currentSymbolBaseAsset');

  useEffect(() => {
    setInputTitle(price ? `
    ${formatBalanceMoneyNumber(quantity * price)}&nbsp;USDT<br>
    ${quantity}&nbsp;${currentSymbolBaseAsset ?? ''}<br>
    Est. margin = ${formatBalanceMoneyNumber(exactSize / leverage)}&nbsp;USDT
  ` : 'Unknown price');
  }, [
    currentSymbolBaseAsset, exactSize, leverage, price, quantity, totalWalletBalance, setInputTitle,
  ]);

  return (
    <>
      <label className="mb-1" htmlFor={`market_${side}_exact`}>Size</label>
      <div className="input-group mb-3">
        <LabeledInput
          label="₮"
          type="text"
          id={`${id}_${side}_exact`}
          value={exactSizeStr}
          innerRef={inputRef as Ref<HTMLInputElement>}
          onPressEnter={() => onOrder(quantity)}
          onChange={setExactSizeStr}
        />
        <Button
          color={side === 'BUY' ? 'success' : 'sell'}
          disabled={exactSize > availableBalance * leverage || exactSize <= 0}
          onClick={() => onOrder(quantity)}
        >
          {capitalize(side)}
        </Button>
      </div>
      <PercentSelector
        availableBalance={availableBalance}
        totalWalletBalance={totalWalletBalance}
        onSetValue={setExactSizeStr}
      />
    </>
  );
};

export default ExactSize;
