import React, { ReactElement, ReactNode, useCallback } from 'react';
import { useSilent, useValue } from 'use-change';

import * as api from '../../../../../api';
import { RootStore } from '../../../../../store';
import QuickOrder from './QuickOrder';
import ExactSize from './ExactSize';

interface Props {
  side: api.OrderSide;
  reduceOnly: boolean;
  postOnly: boolean;
  price: number | null;
  id: string;
  tradingType: api.OrderType;
  children?: ReactNode;
}

const TradingSide = ({
  side, reduceOnly, postOnly, price, id, tradingType, children,
}: Props): ReactElement => {
  const symbol = useValue(({ persistent }: RootStore) => persistent, 'symbol');
  const totalWalletBalance = useValue(({ account }: RootStore) => account, 'totalWalletBalance');
  const availableBalance = useValue(({ account }: RootStore) => account, 'availableBalance');
  const symbolInfo = useValue(({ market }: RootStore) => market, 'futuresExchangeSymbols')[symbol];
  const marketOrder = useSilent(({ trading }: RootStore) => trading, 'marketOrder');
  const limitOrder = useSilent(({ trading }: RootStore) => trading, 'limitOrder');
  const onOrder = useCallback((quantity: number) => {
    switch (tradingType) {
      case 'MARKET':
        void marketOrder({
          side, quantity, symbol, reduceOnly,
        });

        break;
      case 'LIMIT':
        if (price !== null) {
          void limitOrder({
            side, quantity, symbol, reduceOnly, postOnly, price,
          });
        }

        break;
      default:
    }
  }, [limitOrder, marketOrder, postOnly, price, reduceOnly, side, symbol, tradingType]);
  const quantityPrecision = symbolInfo?.quantityPrecision ?? 0;

  return (
    <>
      {children && (
        <div className="mb-3 mt-1">
          {children}
        </div>
      )}
      <div className="mb-3">
        <QuickOrder
          totalWalletBalance={totalWalletBalance}
          availableBalance={availableBalance}
          quantityPrecision={quantityPrecision}
          price={price}
          side={side}
          onOrder={onOrder}
        />
      </div>
      <div className="mb-3">
        <ExactSize
          id={id}
          side={side}
          totalWalletBalance={totalWalletBalance}
          availableBalance={availableBalance}
          price={price}
          quantityPrecision={quantityPrecision}
          onOrder={onOrder}
        />
      </div>
    </>
  );
};

export default TradingSide;
