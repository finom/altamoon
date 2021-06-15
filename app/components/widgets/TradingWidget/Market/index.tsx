import React, { ReactElement, useCallback, useState } from 'react';
import { Row, Col } from 'reactstrap';
import * as api from '../../../../api';
import Toggle from '../../../controls/Toggle';
import MarketSide from './MarketSide';

interface Props {
  isWideLayout: boolean;
  postOnly: boolean;
  reduceOnly: boolean;
}

const Market = ({ isWideLayout, postOnly, reduceOnly }: Props): ReactElement => {
  ((n: boolean) => n)(postOnly); // just to temporarily disable TS "never read" error
  const [compactModeSide, setCompactModeSide] = useState<api.OrderSide>('BUY');
  const switchSide = useCallback((v: boolean) => setCompactModeSide(v ? 'BUY' : 'SELL'), []);
  return (
    <>
      {!isWideLayout && (
        <Toggle
          id="marketBuySellSwitch"
          checkedLabel="Buy/Long"
          uncheckedLabel="Sell/Short"
          className="my-3"
          isChecked={compactModeSide === 'BUY'}
          onChange={switchSide}
        />
      )}
      <Row>
        {(isWideLayout || compactModeSide === 'BUY') && (
          <Col>
            <MarketSide side="BUY" reduceOnly={reduceOnly} />
          </Col>
        )}
        {(isWideLayout || compactModeSide === 'SELL') && (
          <Col>
            <MarketSide side="SELL" reduceOnly={reduceOnly} />
          </Col>
        )}
      </Row>
    </>
  );
};

export default Market;
