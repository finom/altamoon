import React, { ReactElement } from 'react';
import { useValue } from 'use-change';
import { MARKET } from '../../../store';
import TradingTab from './TradingTab';
import TradingPriceInput from '../../controls/TradingPriceInput';
import useDraftPrice from './TradingTab/useDraftPrice';

interface Props {
  isWideLayout: boolean;
  postOnly: boolean;
  tradingType: 'STOP_MARKET';
}

const StopMarket = ({ isWideLayout, postOnly, tradingType }: Props): ReactElement => {
  const pricePrecision = useValue(MARKET, 'currentSymbolPricePrecision');

  const {
    shouldShowPriceLine: shouldShowStopBuyDraftPriceLine,
    setShouldShowPriceLine: setShouldShowStopBuyPriceLine,
    priceStr: stopBuyPriceStr,
    setPriceStr: setStopBuyPriceStr,
    price: stopBuyPrice,
  } = useDraftPrice('stopBuyPrice', 'shouldShowStopBuyDraftPriceLine', { pricePrecision });

  const {
    shouldShowPriceLine: shouldShowStopSellDraftPriceLine,
    setShouldShowPriceLine: setShouldShowStopSellPriceLine,
    priceStr: stopSellPriceStr,
    setPriceStr: setStopSellPriceStr,
    price: stopSellPrice,
  } = useDraftPrice('stopSellPrice', 'shouldShowStopSellDraftPriceLine', { pricePrecision });

  return (
    <TradingTab
      id="stopMarketTab"
      buyPrice={stopBuyPrice}
      sellPrice={stopSellPrice}
      stopBuyPrice={stopBuyPrice}
      stopSellPrice={stopSellPrice}
      isWideLayout={isWideLayout}
      postOnly={postOnly}
      tradingType={tradingType}
      buyNode={(
        <>
          <label htmlFor="stopBuyPrice" className="mb-1">Stop Buy Price</label>
          <TradingPriceInput
            side="STOP_BUY"
            id="stopBuyPrice"
            value={stopBuyPriceStr}
            onChange={setStopBuyPriceStr}
            shouldShowPriceLine={shouldShowStopBuyDraftPriceLine}
            onChangeShouldShowPriceLine={setShouldShowStopBuyPriceLine}
          />
        </>
      )}
      sellNode={(
        <>
          <label htmlFor="stopSellPrice" className="mb-1">Stop Sell Price</label>
          <TradingPriceInput
            side="STOP_SELL"
            id="stopSellPrice"
            value={stopSellPriceStr}
            onChange={setStopSellPriceStr}
            shouldShowPriceLine={shouldShowStopSellDraftPriceLine}
            onChangeShouldShowPriceLine={setShouldShowStopSellPriceLine}
          />
        </>
      )}
    />
  );
};

export default StopMarket;
