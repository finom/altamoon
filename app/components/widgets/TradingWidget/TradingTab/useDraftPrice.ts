import { Dispatch, SetStateAction, useState } from 'react';
import useChange from 'use-change';
import { TRADING } from '../../../../store';
import useDepsUpdateEffect from '../../../../hooks/useDepsUpdateEffect';
import floorByPrecision from '../../../../lib/floorByPrecision';

export default function useDraftPrice(
  priceKey: 'limitBuyPrice' | 'limitSellPrice' | 'stopBuyPrice' | 'stopSellPrice',
  shouldShowKey: 'shouldShowLimitBuyPriceLine'
  | 'shouldShowLimitSellPriceLine'
  | 'shouldShowStopBuyDraftPriceLine'
  | 'shouldShowStopSellDraftPriceLine',
  { pricePrecision } : { pricePrecision: number },
): {
    shouldShowPriceLine: boolean;
    setShouldShowPriceLine: (value: boolean | ((value: boolean) => boolean)) => void;
    priceStr: string;
    setPriceStr: Dispatch<SetStateAction<string>>;
    price: number | null;
  } {
  const [price, setPrice] = useChange(TRADING, priceKey);
  const [
    shouldShowPriceLine, setShouldShowPriceLine,
  ] = useChange(TRADING, shouldShowKey);
  const [priceStr, setPriceStr] = useState(price?.toString() ?? '');

  useDepsUpdateEffect(() => {
    if (!priceStr || !Number.isNaN(+priceStr)) {
      // TODO use Trading['parsePrice']
      setPrice(+priceStr > 0 ? floorByPrecision(+priceStr, pricePrecision) : null);
    }
  }, [pricePrecision, priceStr, setPrice]);

  return {
    shouldShowPriceLine,
    setShouldShowPriceLine,
    priceStr,
    setPriceStr,
    price,
  };
}
