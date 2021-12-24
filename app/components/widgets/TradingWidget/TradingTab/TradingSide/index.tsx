import React, {
  memo, ReactElement, ReactNode, useCallback,
} from 'react';
import useChange, { useSilent, useValue } from 'use-change';

import * as api from '../../../../../api';
import { ACCOUNT, PERSISTENT, TRADING } from '../../../../../store';
import QuickOrder from './QuickOrder';
import ExactSize from './ExactSize';
import useValueDebounced from '../../../../../hooks/useValueDebounced';

interface Props {
  side: api.OrderSide;
  postOnly: boolean;
  price: number | null;
  stopPrice: number | null;
  id: string;
  tradingType: api.OrderType;
  exactSizeStr: string;
  setExactSizeStr: (value: string) => void;
  children?: ReactNode;
}

const TradingSide = ({
  side, postOnly, price, stopPrice, id, tradingType, children,
  exactSizeStr, setExactSizeStr,
}: Props): ReactElement => {
  const symbol = useValue(PERSISTENT, 'symbol');
  const totalWalletBalance = useValue(ACCOUNT, 'totalWalletBalance');
  const availableBalance = useValueDebounced(ACCOUNT, 'availableBalance');
  const marketOrder = useSilent(TRADING, 'marketOrder');
  const limitOrder = useSilent(TRADING, 'limitOrder');
  const stopMarketOrder = useSilent(TRADING, 'stopMarketOrder');
  const stopLimitOrder = useSilent(TRADING, 'stopLimitOrder');
  const [buyReduceOnly, setBuyReduceOnly] = useChange(PERSISTENT, 'tradingBuyReduceOnly');
  const [sellReduceOnly, setSellReduceOnly] = useChange(PERSISTENT, 'tradingSellReduceOnly');
  const reduceOnly = side === 'BUY' ? buyReduceOnly : sellReduceOnly;
  const setReduceOnly = side === 'BUY' ? setBuyReduceOnly : setSellReduceOnly;

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
      case 'STOP_MARKET':
        if (stopPrice !== null) {
          void stopMarketOrder({
            side, quantity, symbol, stopPrice, reduceOnly,
          });
        }

        break;
      case 'STOP':
        if (price !== null && stopPrice !== null) {
          void stopLimitOrder({
            side, quantity, symbol, stopPrice, reduceOnly, postOnly, price,
          });
        }

        break;
      default:
        throw new Error(`Orders of type ${tradingType} aren't supported`);
    }
  }, [
    limitOrder, marketOrder, postOnly, price, reduceOnly, side, stopLimitOrder, stopMarketOrder,
    stopPrice, symbol, tradingType,
  ]);

  return (
    <>
      <div className="form-check form-check-inline mt-2 mb-2">
        <label className="form-check-label" htmlFor={`reduceOnly_${side}`}>
          <input
            className="form-check-input"
            type="checkbox"
            id={`reduceOnly_${side}`}
            onChange={({ target }) => setReduceOnly(target.checked)}
            checked={reduceOnly}
          />
          {' '}
          Reduce-only
        </label>
      </div>
      {children && (
        <div className="mb-3 mt-1">
          {children}
        </div>
      )}
      <div className="mb-3">
        <ExactSize
          id={id}
          side={side}
          tradingType={tradingType}
          totalWalletBalance={totalWalletBalance}
          availableBalance={availableBalance}
          price={price}
          exactSizeStr={exactSizeStr}
          setExactSizeStr={setExactSizeStr}
          onOrder={onOrder}
        />
      </div>
      <div className="mb-3">
        <QuickOrder
          totalWalletBalance={totalWalletBalance}
          availableBalance={availableBalance}
          price={price}
          side={side}
          tradingType={tradingType}
          onOrder={onOrder}
        />
      </div>
    </>
  );
};

export default memo(TradingSide);
