import React, { ReactElement, useState } from 'react';
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

  const [exactSizeBuyStr, setExactSizeBuyStr] = useState('');
  const [exactSizeSellStr, setExactSizeSellStr] = useState('');

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
      exactSizeBuyStr={exactSizeBuyStr}
      setExactSizeBuyStr={setExactSizeBuyStr}
      exactSizeSellStr={exactSizeSellStr}
      setExactSizeSellStr={setExactSizeSellStr}
    />
  );
};

export default Market;
