import { Dispatch, SetStateAction, useState } from 'react';
import useChange from 'use-change';
import { RootStore } from '../../../../store';
import useDepsUpdateEffect from '../../../../hooks/useDepsUpdateEffect';
import floorByPrecision from '../../../../lib/floorByPrecision';

export default function useDraftPrice(
  priceKey: 'limitBuyPrice' | 'limitSellPrice' | 'stopBuyPrice' | 'stopSellPrice',
  shouldShowKey: 'shouldShowLimitBuyPriceLine'
  | 'shouldShowLimitSellPriceLine'
  | 'shouldShowStopBuyPriceLine'
  | 'shouldShowStopSellPriceLine',
  { pricePrecision } : { pricePrecision: number },
): {
    shouldShowPriceLine: boolean;
    setShouldShowPriceLine: (value: boolean | ((value: boolean) => boolean)) => void;
    priceStr: string;
    setPriceStr: Dispatch<SetStateAction<string>>;
    price: number | null;
  } {
  const [price, setPrice] = useChange(({ trading }: RootStore) => trading, priceKey);
  const [
    shouldShowPriceLine, setShouldShowPriceLine,
  ] = useChange(({ trading }: RootStore) => trading, shouldShowKey);
  const [priceStr, setPriceStr] = useState(price?.toString() ?? '');

  useDepsUpdateEffect(() => {
    if (!priceStr || !Number.isNaN(+priceStr)) {
      setPrice(+priceStr > 0 ? floorByPrecision(+priceStr, pricePrecision) : null);
    }
  }, [pricePrecision, priceStr, setPrice]);

  useDepsUpdateEffect(() => {
    setPriceStr(price ? floorByPrecision(price, pricePrecision).toString() : '');
  }, [price, pricePrecision]);

  return {
    shouldShowPriceLine,
    setShouldShowPriceLine,
    priceStr,
    setPriceStr,
    price,
  };
}
