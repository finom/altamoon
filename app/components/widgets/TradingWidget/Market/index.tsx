import React, { ReactElement, useCallback, useState } from 'react';
import { Row, Col } from 'reactstrap';
import Toggle from '../../../controls/Toggle';
import MarketSide from './MarketSide';

interface Props {
  isWideLayout: boolean;
  postOnly: boolean;
  reduceOnly: boolean;
}

const Market = ({ isWideLayout, postOnly, reduceOnly }: Props): ReactElement => {
  const [compactModeSide, setCompactModeSide] = useState<'buy' | 'sell'>('buy');
  const switchSide = useCallback((v: boolean) => setCompactModeSide(v ? 'buy' : 'sell'), []);
  return (
    <>
      {!isWideLayout && (
        <Toggle
          id="marketBuySellSwitch"
          checkedLabel="Buy/Long"
          uncheckedLabel="Sell/Short"
          className="my-3"
          isChecked={compactModeSide === 'buy'}
          onChange={switchSide}
        />
      )}
      <Row>
        {(isWideLayout || compactModeSide === 'buy') && (
        <Col>
          <MarketSide side="buy" postOnly={postOnly} reduceOnly={reduceOnly} />
        </Col>
        )}

        {(isWideLayout || compactModeSide === 'sell') && (
        <Col>
          <MarketSide side="sell" postOnly={postOnly} reduceOnly={reduceOnly} />
        </Col>
        )}
      </Row>
    </>
  );

  /* const [size, setSize] = useState(0);
  return (
    <>
      <Toggle id="marketBuySellSwitch"
      checkedLabel="Buy/Long" uncheckedLabel="Sell/Short" className="my-3" />
      <QuickOrder totalEquity={100000} availableEquity={40000} />
      <div className="mb-1">Exact size</div>
      <LabeledInput
        label="Qty"
        rightLabel="Y"
        id="marketSize"
        type="text"
        onChange={(v) => setSize(+v || 0)}
        value={`${size}`}
      />
      <div className="input-group mb-3">
        <input type="text" className="form-control"
        placeholder="Recipient's username" aria-label="Recipient's username"
        aria-describedby="button-addon2" />
        <button className="btn btn-secondary" type="button" id="button-addon2">Button</button>
      </div>
    </>
  ); */
};

export default Market;
