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
  tradingType: 'STOP_MARKET';
}

const StopMarket = ({
  isWideLayout, postOnly, reduceOnly, tradingType,
}: Props): ReactElement => {
  const pricePrecision = useValue(({ market }: RootStore) => market, 'currentSymbolPricePrecision');

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
      id="stopMarketTab"
      buyPrice={null}
      sellPrice={null}
      stopBuyPrice={stopBuyPrice}
      stopSellPrice={stopSellPrice}
      isWideLayout={isWideLayout}
      postOnly={postOnly}
      reduceOnly={reduceOnly}
      tradingType={tradingType}
      buyNode={(
        <>
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

export default StopMarket;
