import React, {
  LegacyRef, useEffect, ReactElement, useMemo,
} from 'react';
import { Button, Col } from 'reactstrap';
import { useSilent, useValue } from 'use-change';

import * as api from '../../../../../../api';
import useBootstrapTooltip from '../../../../../../hooks/useBootstrapTooltip';
import { MARKET, PERSISTENT, TRADING } from '../../../../../../store';
import formatBalanceMoneyNumber from '../../../../../../lib/formatBalanceMoneyNumber';

interface Props {
  totalWalletBalance: number;
  availableBalance: number;
  price: number | null;
  side: api.OrderSide;
  percent?: number;
  isMax?: boolean;
  onOrder: (qty: number) => void;
}

const ButtonCol = ({
  totalWalletBalance, availableBalance,
  price, side, percent, isMax, onOrder,
}: Props): ReactElement => {
  const preciseSize = isMax ? availableBalance : totalWalletBalance * ((percent ?? 0) / 100);
  const calculateQuantity = useSilent(TRADING, 'calculateQuantity');
  const symbol = useValue(PERSISTENT, 'symbol');
  const leverage = +useValue(TRADING, 'allSymbolsPositionRisk')[symbol]?.leverage || 1;

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

  useEffect(() => {
    setButtonTitle(price ? `${formatBalanceMoneyNumber((quantity * price) / leverage)} USDT (${quantity} ${currentSymbolBaseAsset ?? ''})` : 'Unknown price');
  }, [currentSymbolBaseAsset, leverage, price, quantity, setButtonTitle]);

  return (
    <Col xs={3}>
      <div
        ref={buttonRef as LegacyRef<HTMLDivElement>}
        data-bs-toggle="tooltip"
        data-bs-placement="top"
      >
        <Button
          className="w-100 nowrap"
          disabled={preciseSize > availableBalance || quantity <= 0}
          color={side === 'BUY' ? 'success' : 'sell'}
          onClick={() => onOrder(quantity)}
        >
          {isMax ? 'Max' : `~${percent ?? 0}%`}
        </Button>
      </div>
    </Col>
  );
};

export default ButtonCol;
