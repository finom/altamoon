import React, { ReactElement } from 'react';
import { useValue } from 'use-change';
import { MARKET } from '../../../store';
import TradingTab from './TradingTab';
import TradingPriceInput from '../../controls/TradingPriceInput';
import useDraftPrice from './TradingTab/useDraftPrice';

interface Props {
  isWideLayout: boolean;
  postOnly: boolean;
  tradingType: 'LIMIT';
}

const Limit = ({ isWideLayout, postOnly, tradingType }: Props): ReactElement => {
  const pricePrecision = useValue(MARKET, 'currentSymbolPricePrecision');

  const {
    shouldShowPriceLine: shouldShowLimitBuyPriceLine,
    setShouldShowPriceLine: setShouldShowLimitBuyPriceLine,
    priceStr: buyPriceStr,
    setPriceStr: setBuyPriceStr,
    price: buyPrice,
  } = useDraftPrice('limitBuyPrice', 'shouldShowLimitBuyPriceLine', { pricePrecision });

  const {
    shouldShowPriceLine: shouldShowLimitSellPriceLine,
    setShouldShowPriceLine: setShouldShowLimitSellPriceLine,
    priceStr: sellPriceStr,
    setPriceStr: setSellPriceStr,
    price: sellPrice,
  } = useDraftPrice('limitSellPrice', 'shouldShowLimitSellPriceLine', { pricePrecision });

  return (
    <TradingTab
      id="limitTab"
      buyPrice={buyPrice}
      sellPrice={sellPrice}
      stopBuyPrice={null}
      stopSellPrice={null}
      isWideLayout={isWideLayout}
      postOnly={postOnly}
      tradingType={tradingType}
      buyNode={(
        <>
          <label htmlFor="limitBuyPrice" className="mb-1">Buy Price</label>
          <TradingPriceInput
            side="BUY"
            id="limitBuyPrice"
            value={buyPriceStr}
            onChange={setBuyPriceStr}
            shouldShowPriceLine={shouldShowLimitBuyPriceLine}
            onChangeShouldShowPriceLine={setShouldShowLimitBuyPriceLine}
          />
        </>
      )}
      sellNode={(
        <>
          <label htmlFor="limitSellPrice" className="mb-1">Sell Price</label>
          <TradingPriceInput
            side="SELL"
            id="limitSellPrice"
            value={sellPriceStr}
            onChange={setSellPriceStr}
            shouldShowPriceLine={shouldShowLimitSellPriceLine}
            onChangeShouldShowPriceLine={setShouldShowLimitSellPriceLine}
          />
        </>
      )}
    />
  );
};

export default Limit;
