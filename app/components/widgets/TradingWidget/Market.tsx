import React, { ReactElement } from 'react';
import useChange from 'use-change';
import useValueDebounced from '../../../hooks/useValueDebounced';
import { MARKET, TRADING } from '../../../store';
import TradingTab from './TradingTab';

interface Props {
  isWideLayout: boolean;
  postOnly: boolean;
  tradingType: 'MARKET';
}

const Market = ({ isWideLayout, postOnly, tradingType }: Props): ReactElement => {
  const price = useValueDebounced(MARKET, 'currentSymbolLastPrice');

  const [exactSizeBuyStr, setExactSizeBuyStr] = useChange(TRADING, 'exactSizeBuyStr');
  const [exactSizeSellStr, setExactSizeSellStr] = useChange(TRADING, 'exactSizeSellStr');

  return (
    <TradingTab
      id="marketTab"
      buyPrice={price}
      sellPrice={price}
      stopBuyPrice={null}
      stopSellPrice={null}
      isWideLayout={isWideLayout}
      postOnly={postOnly}
      tradingType={tradingType}
      exactSizeBuyStr={exactSizeBuyStr}
      setExactSizeBuyStr={setExactSizeBuyStr}
      exactSizeSellStr={exactSizeSellStr}
      setExactSizeSellStr={setExactSizeSellStr}
    />
  );
};

export default Market;
