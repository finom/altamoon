import React, { LegacyRef, ReactElement, useMemo } from 'react';
import { Button, Col } from 'reactstrap';
import { useSilent, useValue } from 'use-change';

import * as api from '../../../../../../api';
import useBootstrapTooltip from '../../../../../../hooks/useBootstrapTooltip';
import { MARKET, PERSISTENT, TRADING } from '../../../../../../store';
import usePriceTitle from '../usePriceTitle';

interface Props {
  totalWalletBalance: number;
  availableBalance: number;
  price: number | null;
  side: api.OrderSide;
  percent?: number;
  onOrder: (qty: number) => void;
}

const ButtonCol = ({
  totalWalletBalance, availableBalance,
  price, side, percent, onOrder,
}: Props): ReactElement => {
  const calculateQuantity = useSilent(TRADING, 'calculateQuantity');
  const getFeeRate = useSilent(TRADING, 'getFeeRate');
  const symbol = useValue(PERSISTENT, 'symbol');
  const buttonsCount = useValue(PERSISTENT, 'tradingWidgetPercentButtonsCount');
  const openPositions = useValue(TRADING, 'openPositions');

  const leverage = +useValue(TRADING, 'allSymbolsPositionRisk')[symbol]?.leverage || 1;
  const preciseSize = totalWalletBalance * ((percent ?? 0) / 100) * leverage;

  const quantity = useMemo(() => {
    if (typeof price !== 'number') return 0;

    return calculateQuantity({
      symbol,
      price,
      size: preciseSize,
    });
  }, [calculateQuantity, preciseSize, price, symbol]);
  const [buttonRef, setButtonTitle] = useBootstrapTooltip<HTMLSpanElement>();
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
    size: preciseSize,
    price,
    quantity,
    setTitle: setButtonTitle,
  });

  return (
    <Col xs={12 / buttonsCount}>
      <div
        ref={buttonRef as LegacyRef<HTMLDivElement>}
        data-bs-toggle="tooltip"
        data-bs-placement="top"
      >
        <Button
          className="w-100 nowrap"
          disabled={
            preciseSize > availableBalance * leverage + Math.abs(oppositeSideSize) || quantity <= 0
          }
          color={side === 'BUY' ? 'success' : 'sell'}
          onClick={() => onOrder(quantity)}
        >
          {percent ?? 0}
          %
        </Button>
      </div>
    </Col>
  );
};

export default ButtonCol;
