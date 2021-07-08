import React, { LegacyRef, useEffect, ReactElement } from 'react';
import { format } from 'd3-format';
import { Button, Col } from 'reactstrap';
import { useValue } from 'use-change';

import * as api from '../../../../../../api';
import useBootstrapTooltip from '../../../../../../hooks/useBootstrapTooltip';
import { MARKET, TRADING } from '../../../../../../store';
import css from './style.css';

interface Props {
  totalWalletBalance: number;
  availableBalance: number;
  quantityPrecision: number;
  price: number | null;
  side: api.OrderSide;
  percent?: number;
  isMax?: boolean;
  onOrder: (qty: number) => void;
}

const formatMoney = (value: number) => format(value > 1000 ? ',.0f' : ',.2f')(value);

const ButtonCol = ({
  totalWalletBalance, availableBalance, quantityPrecision,
  price, side, percent, isMax, onOrder,
}: Props): ReactElement => {
  const preciseSize = isMax ? availableBalance : totalWalletBalance * ((percent ?? 0) / 100);
  const currentSymbolLeverage = useValue(TRADING, 'currentSymbolLeverage');
  const quantity: number = typeof price === 'number' ? Math.floor(
    currentSymbolLeverage * (preciseSize / price) * (10 ** quantityPrecision),
  ) / (10 ** quantityPrecision) || 0 : 0;
  const [buttonRef, setButtonTitle] = useBootstrapTooltip<HTMLSpanElement>();
  const currentSymbolBaseAsset = useValue(MARKET, 'currentSymbolBaseAsset');

  useEffect(() => {
    setButtonTitle(`${quantity} ${currentSymbolBaseAsset ?? ''}`);
  }, [currentSymbolBaseAsset, quantity, setButtonTitle]);

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
          <br />
          <span className={css.value}>
            <span className="o-50">≤</span>
            {' '}
            <span className="o-75">
              {formatMoney(preciseSize)}
            </span>
            {' '}
            <span className="o-75">₮</span>
          </span>
        </Button>
      </div>
    </Col>
  );
};

export default ButtonCol;
