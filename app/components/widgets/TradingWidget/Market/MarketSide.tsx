import { capitalize } from 'lodash';
import React, { ReactElement, useCallback, useState } from 'react';
import { Button, Input } from 'reactstrap';
import { useValue } from 'use-change';
import * as api from '../../../../api';
import { RootStore } from '../../../../store';
import QuickOrder from '../QuickOrder';

interface Props {
  side: api.OrderSide;
  postOnly: boolean;
  reduceOnly: boolean;
}

const MarketSide = ({ side, postOnly, reduceOnly }: Props): ReactElement => {
  const [exactSize, setExactSize] = useState(0);
  const symbol = useValue(({ persistent }: RootStore) => persistent, 'symbol');
  const onFuturesOrder = useCallback((qty: number) => {
    const createOrder = side === 'BUY' ? api.futuresMarketBuy : api.futuresMarketSell;
    void createOrder(symbol, qty);
  }, [side, symbol]);

  return (
    <>
      <QuickOrder totalEquity={100000} availableEquity={40000} side={side} />
      {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
      <label className="mb-1" htmlFor={`market_${side}_exact`}>Exact Size</label>
      <div className="input-group mb-3">
        <Input
          type="text"
          placeholder="Size"
          id={`market_${side}_exact`}
          value={exactSize}
          onChange={({ target }) => setExactSize(+target.value || 0)}
        />
        <Button
          color={side === 'BUY' ? 'success' : 'sell'}
        >
          {capitalize(side)}
        </Button>
      </div>
    </>
  );
};

export default MarketSide;
