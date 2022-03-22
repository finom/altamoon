import { capitalize } from 'lodash';
import React, { ReactElement, Ref, useMemo } from 'react';
import { Button } from 'reactstrap';
import { useSilent, useValue } from 'use-change';
import { Tooltip } from 'bootstrap';

import * as api from '../../../../../../api';
import useBootstrapTooltip from '../../../../../../hooks/useBootstrapTooltip';
import { MARKET, PERSISTENT, TRADING } from '../../../../../../store';
import SizeInput from './SizeInput';
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
  isPercentMode: boolean;
  setIsPercentMode: (value: boolean) => void;
  onOrder: (qty: number) => void;
}

const tooltipOptions: Partial<Tooltip.Options> = {
  offset: '0, 6',
  trigger: 'focus',
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
  isPercentMode,
  setIsPercentMode,
}: Props): ReactElement => {
  const calculateQuantity = useSilent(TRADING, 'calculateQuantity');
  const calculateSizeFromString = useSilent(TRADING, 'calculateSizeFromString');
  const getFeeRate = useSilent(TRADING, 'getFeeRate');
  const symbol = useValue(PERSISTENT, 'symbol');
  const leverage = +useValue(TRADING, 'allSymbolsPositionRisk')[symbol]?.leverage || 1;
  const openPositions = useValue(TRADING, 'openPositions');

  const exactSize = useMemo(
    () => calculateSizeFromString(symbol, exactSizeStr, { isPercentMode }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [calculateSizeFromString, exactSizeStr, symbol, totalWalletBalance, leverage, isPercentMode],
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
        <SizeInput
          id={`${id}_${side}_exact`}
          value={exactSizeStr}
          innerRef={inputRef as Ref<HTMLInputElement>}
          onPressEnter={() => onOrder(quantity)}
          onChange={setExactSizeStr}
          isPercentMode={isPercentMode}
          setIsPercentMode={setIsPercentMode}
        />
        <Button
          color={side === 'BUY' ? 'success' : 'sell'}
          disabled={
            exactSize > availableBalance * leverage + Math.abs(oppositeSideSize) || quantity <= 0
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
        setIsPercentMode={setIsPercentMode}
      />
    </>
  );
};

export default ExactSize;
