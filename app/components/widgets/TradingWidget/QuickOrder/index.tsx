import { capitalize } from 'lodash';
import React, { ReactElement } from 'react';
import { Row } from 'reactstrap';

import * as api from '../../../../api';
import css from './style.css';
import ButtonCol from './ButtonCol';

interface Props {
  totalWalletBalance: number;
  availableBalance: number;
  quantityPrecision: number;
  currentSymbolLastPrice: number;
  side: api.OrderSide;
  onOrder: (qty: number) => void;
}

const QuickOrder = ({
  totalWalletBalance, availableBalance, quantityPrecision,
  currentSymbolLastPrice, side, onOrder,
}: Props): ReactElement => (
  <>
    <div className="mb-1 mt-2">
      Quick
      {' '}
      {capitalize(side)}
    </div>
    <Row className={`${css.wrapper} mb-3`}>
      <ButtonCol
        totalWalletBalance={totalWalletBalance}
        availableBalance={availableBalance}
        quantityPrecision={quantityPrecision}
        currentSymbolLastPrice={currentSymbolLastPrice}
        side={side}
        percent={10}
        onOrder={onOrder}
      />
      <ButtonCol
        totalWalletBalance={totalWalletBalance}
        availableBalance={availableBalance}
        quantityPrecision={quantityPrecision}
        currentSymbolLastPrice={currentSymbolLastPrice}
        side={side}
        percent={25}
        onOrder={onOrder}
      />
      <ButtonCol
        totalWalletBalance={totalWalletBalance}
        availableBalance={availableBalance}
        quantityPrecision={quantityPrecision}
        currentSymbolLastPrice={currentSymbolLastPrice}
        side={side}
        percent={50}
        onOrder={onOrder}
      />
      <ButtonCol
        totalWalletBalance={totalWalletBalance}
        availableBalance={availableBalance}
        quantityPrecision={quantityPrecision}
        currentSymbolLastPrice={currentSymbolLastPrice}
        side={side}
        isMax
        onOrder={onOrder}
      />
    </Row>
  </>
);

export default QuickOrder;
