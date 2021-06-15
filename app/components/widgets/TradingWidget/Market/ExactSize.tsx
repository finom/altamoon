import { capitalize } from 'lodash';
import React, {
  ReactElement, Ref, useEffect, useState,
} from 'react';
import { Button } from 'reactstrap';
import { useValue } from 'use-change';

import * as api from '../../../../api';
import useBootstrapTooltip from '../../../../hooks/useBootstrapTooltip';
import { RootStore } from '../../../../store';
import LabeledInput from '../../../controls/LabeledInput';
import PercentSelector from './PercentSelector';

interface Props {
  side: api.OrderSide;
  totalWalletBalance: number;
  availableBalance: number;
  currentSymbolLastPrice: number;
  quantityPrecision: number;
  onOrder: (qty: number) => void;
}

const tooltipOptions = {
  offset: '0, 6',
};

const ExactSize = ({
  side,
  totalWalletBalance,
  availableBalance,
  currentSymbolLastPrice,
  quantityPrecision,
  onOrder,
}: Props): ReactElement => {
  const [exactSizeStr, setExactSizeStr] = useState('0');
  const exactSize = exactSizeStr.endsWith('%')
    ? (+exactSizeStr.replace('%', '') / 100) * totalWalletBalance || 0
    : +exactSizeStr || 0;
  const currentSymbolLeverage = useValue(({ trading }: RootStore) => trading, 'currentSymbolLeverage');
  const quantity = Math.floor(
    currentSymbolLeverage
      * (exactSize / currentSymbolLastPrice) * (10 ** quantityPrecision),
  ) / (10 ** quantityPrecision);
  const [inputRef, setInputTitle] = useBootstrapTooltip<HTMLInputElement>(tooltipOptions);
  const currentSymbolBaseAsset = useValue(({ market }: RootStore) => market, 'currentSymbolBaseAsset');

  useEffect(() => {
    setInputTitle(`${quantity} ${currentSymbolBaseAsset ?? ''}`);
  }, [currentSymbolBaseAsset, quantity, setInputTitle]);

  return (
    <>
      {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
      <label className="mb-1" htmlFor={`market_${side}_exact`}>Set Size</label>
      <div className="input-group mb-3">
        <LabeledInput
          label="₮"
          type="text"
          id={`market_${side}_exact`}
          value={exactSizeStr}
          innerRef={inputRef as Ref<HTMLInputElement>}
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
