import { capitalize } from 'lodash';
import React, { ReactElement } from 'react';
import { Row } from 'reactstrap';

import * as api from '../../../../../../api';
import css from './style.css';
import ButtonCol from './ButtonCol';

interface Props {
  totalWalletBalance: number;
  availableBalance: number;
  quantityPrecision: number;
  price: number | null;
  side: api.OrderSide;
  onOrder: (qty: number) => void;
}

const QuickOrder = ({
  totalWalletBalance, availableBalance, quantityPrecision,
  price, side, onOrder,
}: Props): ReactElement => (
  <>
    <div className="mb-1">
      Quick
      {' '}
      {capitalize(side)}
    </div>
    <Row className={css.wrapper}>
      <ButtonCol
        totalWalletBalance={totalWalletBalance}
        availableBalance={availableBalance}
        quantityPrecision={quantityPrecision}
        price={price}
        side={side}
        percent={10}
        onOrder={onOrder}
      />
      <ButtonCol
        totalWalletBalance={totalWalletBalance}
        availableBalance={availableBalance}
        quantityPrecision={quantityPrecision}
        price={price}
        side={side}
        percent={25}
        onOrder={onOrder}
      />
      <ButtonCol
        totalWalletBalance={totalWalletBalance}
        availableBalance={availableBalance}
        quantityPrecision={quantityPrecision}
        price={price}
        side={side}
        percent={50}
        onOrder={onOrder}
      />
      <ButtonCol
        totalWalletBalance={totalWalletBalance}
        availableBalance={availableBalance}
        quantityPrecision={quantityPrecision}
        price={price}
        side={side}
        isMax
        onOrder={onOrder}
      />
    </Row>
  </>
);

export default QuickOrder;
