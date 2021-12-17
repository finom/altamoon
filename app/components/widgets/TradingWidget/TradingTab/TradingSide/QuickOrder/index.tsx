import { capitalize, times } from 'lodash';
import React, { memo, ReactElement } from 'react';
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
        {times(buttonsCount).map((_, index) => (
          <ButtonCol
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            totalWalletBalance={totalWalletBalance}
            availableBalance={availableBalance}
            price={price}
            side={side}
            percent={buttonsLayouts[buttonsCount][index]}
            onOrder={onOrder}
          />
        ))}
      </Row>
    </>
  );
};

export default memo(QuickOrder);
