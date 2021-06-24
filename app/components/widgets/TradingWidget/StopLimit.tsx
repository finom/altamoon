import React, { ReactElement } from 'react';
import { useValue } from 'use-change';
import { RootStore } from '../../../store';
import TradingTab from './TradingTab';
import TradingPriceInput from '../../controls/TradingPriceInput';
import useDraftPrice from './TradingTab/useDraftPrice';

interface Props {
  isWideLayout: boolean;
  postOnly: boolean;
  reduceOnly: boolean;
  tradingType: 'STOP';
}

const StopLimit = ({
  isWideLayout, postOnly, reduceOnly, tradingType,
}: Props): ReactElement => {
  const pricePrecision = useValue(({ market }: RootStore) => market, 'currentSymbolPricePrecision');

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

  const {
    shouldShowPriceLine: shouldShowStopBuyPriceLine,
    setShouldShowPriceLine: setShouldShowStopBuyPriceLine,
    priceStr: stopBuyPriceStr,
    setPriceStr: setStopBuyPriceStr,
    price: stopBuyPrice,
  } = useDraftPrice('stopBuyPrice', 'shouldShowStopBuyPriceLine', { pricePrecision });

  const {
    shouldShowPriceLine: shouldShowStopSellPriceLine,
    setShouldShowPriceLine: setShouldShowStopSellPriceLine,
    priceStr: stopSellPriceStr,
    setPriceStr: setStopSellPriceStr,
    price: stopSellPrice,
  } = useDraftPrice('stopSellPrice', 'shouldShowStopSellPriceLine', { pricePrecision });

  return (
    <TradingTab
      id="stopLimitTab"
      buyPrice={buyPrice}
      sellPrice={sellPrice}
      stopBuyPrice={stopBuyPrice}
      stopSellPrice={stopSellPrice}
      isWideLayout={isWideLayout}
      postOnly={postOnly}
      reduceOnly={reduceOnly}
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
          <label htmlFor="stopBuyPrice" className="mb-1">Stop Buy Price</label>
          <TradingPriceInput
            side="STOP_BUY"
            id="stopBuyPrice"
            value={stopBuyPriceStr}
            onChange={setStopBuyPriceStr}
            shouldShowPriceLine={shouldShowStopBuyPriceLine}
            onChangeShouldShowPriceLine={setShouldShowStopBuyPriceLine}
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
          <label htmlFor="stopSellPrice" className="mb-1">Stop Sell Price</label>
          <TradingPriceInput
            side="STOP_SELL"
            id="stopSellPrice"
            value={stopSellPriceStr}
            onChange={setStopSellPriceStr}
            shouldShowPriceLine={shouldShowStopSellPriceLine}
            onChangeShouldShowPriceLine={setShouldShowStopSellPriceLine}
          />
        </>
      )}
    />
  );
};

export default StopLimit;
