import React, { ReactElement, useState } from 'react';
import useChange, { useValue } from 'use-change';
import { RootStore } from '../../../store';
import TradingTab from './TradingTab';
import TradingPriceInput from '../../controls/TradingPriceInput';
import useDepsUpdateEffect from '../../../hooks/useDepsUpdateEffect';
import floorByPrecision from '../../../lib/floorByPrecision';

interface Props {
  isWideLayout: boolean;
  postOnly: boolean;
  reduceOnly: boolean;
  tradingType: 'LIMIT';
}

const Limit = ({
  isWideLayout, postOnly, reduceOnly, tradingType,
}: Props): ReactElement => {
  const [buyPrice, setBuyPrice] = useChange(({ trading }: RootStore) => trading, 'limitBuyPrice');
  const [shouldShowLimitBuyPriceLine, setShouldShowLimitBuyPriceLine] = useChange(({ trading }: RootStore) => trading, 'shouldShowLimitBuyPriceLine');
  const [buyPriceStr, setBuyPriceStr] = useState(buyPrice?.toString() ?? '');

  const [sellPrice, setSellPrice] = useChange(({ trading }: RootStore) => trading, 'limitSellPrice');
  const [shouldShowLimitSellPriceLine, setShouldShowLimitSellPriceLine] = useChange(({ trading }: RootStore) => trading, 'shouldShowLimitSellPriceLine');
  const [sellPriceStr, setSellPriceStr] = useState(sellPrice?.toString() ?? '');

  const pricePrecision = useValue(({ market }: RootStore) => market, 'currentSymbolPricePrecision');

  useDepsUpdateEffect(() => {
    if (!buyPriceStr || !Number.isNaN(+buyPriceStr)) {
      setBuyPrice(+buyPriceStr > 0 ? floorByPrecision(+buyPriceStr, pricePrecision) : null);
    }
  }, [buyPriceStr, pricePrecision, setBuyPrice]);

  useDepsUpdateEffect(() => {
    if (!sellPriceStr || !Number.isNaN(+sellPriceStr)) {
      setSellPrice(+sellPriceStr > 0 ? floorByPrecision(+sellPriceStr, pricePrecision) : null);
    }
  }, [pricePrecision, sellPriceStr, setSellPrice]);

  useDepsUpdateEffect(() => {
    setBuyPriceStr(buyPrice ? floorByPrecision(buyPrice, pricePrecision).toString() : '');
  }, [buyPrice, pricePrecision]);

  useDepsUpdateEffect(() => {
    setSellPriceStr(sellPrice ? floorByPrecision(sellPrice, pricePrecision).toString() : '');
  }, [pricePrecision, sellPrice]);

  return (
    <TradingTab
      id="limitTab"
      buyPrice={buyPrice}
      sellPrice={sellPrice}
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
