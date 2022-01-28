import React, { ReactElement } from 'react';
import useValueDebounced from '../../../hooks/useValueDebounced';
import { MARKET } from '../../../store';
import TradingTab from './TradingTab';

interface Props {
  isWideLayout: boolean;
  postOnly: boolean;
  tradingType: 'MARKET';
}

const Market = ({ isWideLayout, postOnly, tradingType }: Props): ReactElement => {
  const price = useValueDebounced(MARKET, 'currentSymbolLastPrice');

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
    />
  );
};

export default Market;
