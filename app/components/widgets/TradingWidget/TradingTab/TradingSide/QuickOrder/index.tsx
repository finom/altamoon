import { capitalize, times } from 'lodash';
import React, { memo, ReactElement } from 'react';
import { Row } from 'reactstrap';
import { useValue } from 'use-change';

import * as api from '../../../../../../api';
import { PERSISTENT } from '../../../../../../store';
import tradingCss from '../../../style.css';
import ButtonCol from './ButtonCol';
import css from './style.css';

interface Props {
  totalWalletBalance: number;
  availableBalance: number;
  price: number | null;
  side: api.OrderSide;
  tradingType: api.OrderType;
  onOrder: (qty: number) => void;
}

const QuickOrder = ({
  totalWalletBalance, availableBalance,
  price, side, tradingType, onOrder,
}: Props): ReactElement => {
  const buttonsCount = useValue(PERSISTENT, 'tradingWidgetPercentButtonsCount');
  const buttonsLayouts = useValue(PERSISTENT, 'tradingWidgetPercentButtonsLayouts');

  return (
    <>
      <div className="mb-1">
        Quick
        {' '}
        <span className={tradingType === 'MARKET' ? css.marketHighlight : undefined}>
          {tradingType.toLowerCase().split('_').map(capitalize).join(' ')}
        </span>
        {' '}
        {capitalize(side)}
      </div>
      <Row className={tradingCss.quickOrderWrapper}>
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
