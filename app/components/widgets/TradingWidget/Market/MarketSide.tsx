import React, { ReactElement, useCallback } from 'react';
import { useSilent, useValue } from 'use-change';

import * as api from '../../../../api';
import { RootStore } from '../../../../store';
import QuickOrder from '../QuickOrder';
import ExactSize from './ExactSize';

interface Props {
  side: api.OrderSide;
  reduceOnly: boolean;
}

const MarketSide = ({ side, reduceOnly }: Props): ReactElement => {
  const symbol = useValue(({ persistent }: RootStore) => persistent, 'symbol');
  const totalWalletBalance = useValue(({ account }: RootStore) => account, 'totalWalletBalance');
  const availableBalance = useValue(({ account }: RootStore) => account, 'availableBalance');
  const symbolInfo = useValue(({ market }: RootStore) => market, 'futuresExchangeSymbols')[symbol];
  const marketOrder = useSilent(({ trading }: RootStore) => trading, 'marketOrder');
  const currentSymbolLastPrice = useValue(({ market }: RootStore) => market, 'currentSymbolLastPrice');
  const onMarketOrder = useCallback((quantity: number) => void marketOrder({
    side, quantity, symbol, reduceOnly,
  }), [marketOrder, reduceOnly, side, symbol]);
  const quantityPrecision = symbolInfo?.quantityPrecision ?? 0;

  return (
    <>
      <QuickOrder
        totalWalletBalance={totalWalletBalance}
        availableBalance={availableBalance}
        quantityPrecision={quantityPrecision}
        currentSymbolLastPrice={currentSymbolLastPrice ?? 0}
        side={side}
        onOrder={onMarketOrder}
      />
      <ExactSize
        side={side}
        totalWalletBalance={totalWalletBalance}
        availableBalance={availableBalance}
        currentSymbolLastPrice={currentSymbolLastPrice ?? 0}
        quantityPrecision={quantityPrecision}
        onOrder={onMarketOrder}
      />
    </>
  );
};

export default MarketSide;
