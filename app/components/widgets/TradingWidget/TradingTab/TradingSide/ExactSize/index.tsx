import { capitalize } from 'lodash';
import React, { ReactElement, Ref, useMemo } from 'react';
import { Button } from 'reactstrap';
import { useSilent, useValue } from 'use-change';

import * as api from '../../../../../../api';
import useBootstrapTooltip from '../../../../../../hooks/useBootstrapTooltip';
import { MARKET, PERSISTENT, TRADING } from '../../../../../../store';
import LabeledInput from '../../../../../controls/LabeledInput';
import usePriceTitle from '../usePriceTitle';
import PercentSelector from './PercentSelector';

interface Props {
  side: api.OrderSide;
  tradingType: api.OrderType;
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
  tradingType,
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
  const getFeeRate = useSilent(TRADING, 'getFeeRate');
  const symbol = useValue(PERSISTENT, 'symbol');
  const leverage = +useValue(TRADING, 'allSymbolsPositionRisk')[symbol]?.leverage || 1;
  const openPositions = useValue(TRADING, 'openPositions');

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
  const oppositeSideSize = useMemo(
    () => openPositions
      .reduce((a, pos) => (pos.side !== side && pos.symbol === symbol ? a + pos.baseValue : a), 0),
    [openPositions, side, symbol],
  );

  usePriceTitle({
    feeRate: getFeeRate('maker'),
    totalWalletBalance,
    currentSymbolBaseAsset,
    leverage,
    size: exactSize,
    price,
    quantity,
    setTitle: setInputTitle,
  });

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
          disabled={
            exactSize > availableBalance * leverage + Math.abs(oppositeSideSize) || exactSize <= 0
          }
          onClick={() => onOrder(quantity)}
        >
          {tradingType.toLowerCase().split('_').map(capitalize).join(' ')}
          {' '}
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
