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

interface Props {
  side: api.OrderSide;
  availableBalance: number;
  currentSymbolLastPrice: number;
  quantityPrecision: number;
  onOrder: (qty: number) => void;
}

const ExactSize = ({
  side,
  availableBalance,
  currentSymbolLastPrice,
  quantityPrecision,
  onOrder,
}: Props): ReactElement => {
  const [exactSize, setExactSize] = useState('0');
  const currentSymbolLeverage = useValue(({ trading }: RootStore) => trading, 'currentSymbolLeverage');
  const quantity = Math.floor(
    currentSymbolLeverage
      * ((+exactSize || 0) / currentSymbolLastPrice) * (10 ** quantityPrecision),
  ) / (10 ** quantityPrecision);
  const [inputRef, setInputTitle] = useBootstrapTooltip<HTMLInputElement>();
  const currentSymbolBaseAsset = useValue(({ market }: RootStore) => market, 'currentSymbolBaseAsset');

  useEffect(() => {
    setInputTitle(`${quantity} ${currentSymbolBaseAsset ?? ''}`);
  }, [currentSymbolBaseAsset, quantity, setInputTitle]);

  return (
    <>
      {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
      <label className="mb-1" htmlFor={`market_${side}_exact`}>Exact Size</label>
      <div className="input-group mb-3">
        <LabeledInput
          label="₮"
          type="number"
          id={`market_${side}_exact`}
          value={exactSize}
          innerRef={inputRef as Ref<HTMLInputElement>}
          onChange={setExactSize}
        />
        <Button
          color={side === 'BUY' ? 'success' : 'sell'}
          disabled={!+exactSize || +exactSize > availableBalance}
          onClick={() => onOrder(+exactSize)}
        >
          {capitalize(side)}
        </Button>
      </div>
    </>
  );
};

export default ExactSize;
