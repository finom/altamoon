import { capitalize } from 'lodash';
import React, {
  ReactElement, Ref, useEffect, useState,
} from 'react';
import { Button } from 'reactstrap';
import { useValue } from 'use-change';

import * as api from '../../../../../../api';
import useBootstrapTooltip from '../../../../../../hooks/useBootstrapTooltip';
import { MARKET, TRADING } from '../../../../../../store';
import LabeledInput from '../../../../../controls/LabeledInput';
import PercentSelector from './PercentSelector';

interface Props {
  side: api.OrderSide;
  totalWalletBalance: number;
  availableBalance: number;
  price: number | null;
  quantityPrecision: number;
  id: string;
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
  quantityPrecision,
  id,
  onOrder,
}: Props): ReactElement => {
  const [exactSizeStr, setExactSizeStr] = useState('0');
  const exactSize = exactSizeStr.endsWith('%')
    ? (+exactSizeStr.replace('%', '') / 100) * totalWalletBalance || 0
    : +exactSizeStr || 0;
  const currentSymbolLeverage = useValue(TRADING, 'currentSymbolLeverage');
  const quantity = typeof price === 'number' ? Math.floor(
    currentSymbolLeverage
      * (exactSize / price) * (10 ** quantityPrecision),
  ) / (10 ** quantityPrecision) : 0;
  const [inputRef, setInputTitle] = useBootstrapTooltip<HTMLInputElement>(tooltipOptions);
  const currentSymbolBaseAsset = useValue(MARKET, 'currentSymbolBaseAsset');

  useEffect(() => {
    setInputTitle(`${quantity} ${currentSymbolBaseAsset ?? ''}`);
  }, [currentSymbolBaseAsset, quantity, setInputTitle]);

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
          disabled={exactSize > availableBalance || exactSize <= 0}
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
