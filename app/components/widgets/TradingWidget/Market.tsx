import React, { ReactElement } from 'react';
import { useValue } from 'use-change';
import { MARKET } from '../../../store';
import TradingTab from './TradingTab';

interface Props {
  isWideLayout: boolean;
  postOnly: boolean;
  reduceOnly: boolean;
  tradingType: 'MARKET';
}

const Market = ({
  isWideLayout, postOnly, reduceOnly, tradingType,
}: Props): ReactElement => {
  const price = useValue(MARKET, 'currentSymbolLastPrice');

  return (
    <TradingTab
      id="marketTab"
      buyPrice={price}
      sellPrice={price}
      stopBuyPrice={null}
      stopSellPrice={null}
      isWideLayout={isWideLayout}
      postOnly={postOnly}
      reduceOnly={reduceOnly}
      tradingType={tradingType}
    />
  );
};

export default Market;
