import React, {
  LegacyRef, useEffect, ReactElement, useMemo,
} from 'react';
import { format } from 'd3-format';
import { Button, Col } from 'reactstrap';
import { useSilent, useValue } from 'use-change';

import * as api from '../../../../../../api';
import useBootstrapTooltip from '../../../../../../hooks/useBootstrapTooltip';
import { MARKET, PERSISTENT, TRADING } from '../../../../../../store';
import css from './style.css';

interface Props {
  totalWalletBalance: number;
  availableBalance: number;
  price: number | null;
  side: api.OrderSide;
  percent?: number;
  isMax?: boolean;
  onOrder: (qty: number) => void;
}

const formatMoney = (value: number) => format(value > 1000 ? ',.0f' : ',.2f')(value);

const ButtonCol = ({
  totalWalletBalance, availableBalance,
  price, side, percent, isMax, onOrder,
}: Props): ReactElement => {
  const preciseSize = isMax ? availableBalance : totalWalletBalance * ((percent ?? 0) / 100);
  const calculateQuantity = useSilent(TRADING, 'calculateQuantity');
  const symbol = useValue(PERSISTENT, 'symbol');

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
