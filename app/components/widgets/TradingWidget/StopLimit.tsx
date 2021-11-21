import React, { ReactElement } from 'react';
import useChange, { useValue } from 'use-change';
import { MARKET, TRADING } from '../../../store';
import TradingTab from './TradingTab';
import TradingPriceInput from '../../controls/TradingPriceInput';
import useDraftPrice from './TradingTab/useDraftPrice';

interface Props {
  isWideLayout: boolean;
  postOnly: boolean;
  tradingType: 'STOP';
}

const StopLimit = ({ isWideLayout, postOnly, tradingType }: Props): ReactElement => {
  const pricePrecision = useValue(MARKET, 'currentSymbolPricePrecision');

  const [exactSizeBuyStr, setExactSizeBuyStr] = useChange(TRADING, 'exactSizeStopLimitBuyStr');
  const [exactSizeSellStr, setExactSizeSellStr] = useChange(TRADING, 'exactSizeStopLimitSellStr');

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
      id="stopLimitTab"
      buyPrice={buyPrice}
      sellPrice={sellPrice}
      stopBuyPrice={stopBuyPrice}
      stopSellPrice={stopSellPrice}
      isWideLayout={isWideLayout}
      postOnly={postOnly}
      tradingType={tradingType}
      exactSizeBuyStr={exactSizeBuyStr}
      setExactSizeBuyStr={setExactSizeBuyStr}
      exactSizeSellStr={exactSizeSellStr}
      setExactSizeSellStr={setExactSizeSellStr}
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
            shouldShowPriceLine={shouldShowStopBuyDraftPriceLine}
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
            shouldShowPriceLine={shouldShowStopSellDraftPriceLine}
            onChangeShouldShowPriceLine={setShouldShowStopSellPriceLine}
          />
        </>
      )}
    />
  );
};

export default StopLimit;
