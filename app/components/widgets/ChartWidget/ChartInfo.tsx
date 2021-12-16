import React, { ReactElement } from 'react';
import { useValue } from 'use-change';
import { MARKET, PERSISTENT } from '../../../store';

import css from './style.css';

const ChartInfo = (): ReactElement => {
  const interval = useValue(PERSISTENT, 'interval');
  const symbol = useValue(PERSISTENT, 'symbol');
  const candles = useValue(MARKET, 'candles');
  const futuresExchangeSymbols = useValue(MARKET, 'futuresExchangeSymbols');

  return (
    <div className={css.marketName}>
      {!!futuresExchangeSymbols[symbol] && !!candles.length ? (
        <>
          {futuresExchangeSymbols[candles[0].symbol].baseAsset}
          /
          {futuresExchangeSymbols[candles[0].symbol].quoteAsset}
          {' '}
          <span className="text-muted">{candles[0].interval}</span>
          <br />
          {(candles[0].symbol !== symbol || candles[0].interval !== interval) && (
          <span className="text-muted text-sm">Loading...</span>
          )}
        </>
      ) : (<span className="text-muted text-sm">Loading...</span>)}

    </div>
  );
};

export default ChartInfo;
