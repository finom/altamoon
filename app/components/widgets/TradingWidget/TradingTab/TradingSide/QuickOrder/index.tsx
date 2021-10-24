import { capitalize, times } from 'lodash';
import React, { ReactElement } from 'react';
import { Row } from 'reactstrap';
import { useValue } from 'use-change';

import * as api from '../../../../../../api';
import { PERSISTENT } from '../../../../../../store';
import css from '../../../style.css';
import ButtonCol from './ButtonCol';

interface Props {
  totalWalletBalance: number;
  availableBalance: number;
  price: number | null;
  side: api.OrderSide;
  onOrder: (qty: number) => void;
}

const QuickOrder = ({
  totalWalletBalance, availableBalance,
  price, side, onOrder,
}: Props): ReactElement => {
  const buttonsCount = useValue(PERSISTENT, 'tradingWidgetPercentButtonsCount');
  const buttonsLayouts = useValue(PERSISTENT, 'tradingWidgetPercentButtonsLayouts');

  return (
    <>
      <div className="mb-1">
        Quick
        {' '}
        {capitalize(side)}
      </div>
      <Row className={css.quickOrderWrapper}>
        {times(buttonsCount - 1).map((_, index) => (
          <ButtonCol
            totalWalletBalance={totalWalletBalance}
            availableBalance={availableBalance}
            price={price}
            side={side}
            percent={buttonsLayouts[buttonsCount][index]}
            onOrder={onOrder}
          />
        ))}
        <ButtonCol
          totalWalletBalance={totalWalletBalance}
          availableBalance={availableBalance}
          price={price}
          side={side}
          isMax
          onOrder={onOrder}
        />
      </Row>
    </>
  );
};

export default QuickOrder;
