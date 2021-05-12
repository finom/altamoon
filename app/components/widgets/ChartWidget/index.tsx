import { CandlestickChartInterval } from 'node-binance-api';
import React, { ReactElement, useEffect, useRef } from 'react';
import useChange, { useValue } from 'use-change';
import CandlestickChart from '../../../lib/CandlestickChart';
import { RootStore } from '../../../store';

import Widget from '../../layout/Widget';

import css from './style.css';

const intervals: CandlestickChartInterval[] = ['1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '12h', '1d'];

const ChartWidget = (): ReactElement => {
  const [interval, setCandleInterval] = useChange(({ persistent }: RootStore) => persistent, 'interval');
  const ref = useRef<HTMLDivElement | null>(null);
  const candleChartRef = useRef<CandlestickChart | null>(null);
  const candles = useValue(({ market }: RootStore) => market, 'candles');
  const symbol = useValue(({ persistent }: RootStore) => persistent, 'symbol');

  useEffect(() => {
    if (candleChartRef.current) {
      candleChartRef.current.update({ candles, symbol });
    }
  }, [candles, symbol]);

  useEffect(() => {
    if (ref.current && !candleChartRef.current) {
      candleChartRef.current = new CandlestickChart(ref.current);
      candleChartRef.current.update({ candles, symbol });
    }
  });

  return (
    <Widget title="Chart">
      <div className="nav nav-pills">
        {intervals.map((intervalsItem, index) => (
          <div
            role="button"
            tabIndex={index}
            className="nav-item cursor-pointer"
            key={intervalsItem}
            onClick={() => { setCandleInterval(intervalsItem); }}
            onKeyDown={() => { setCandleInterval(intervalsItem); }}
          >
            <span className={`nav-link ${interval === intervalsItem ? 'active' : ''}`}>
              {intervalsItem}
            </span>
          </div>
        ))}
      </div>
      <div
        className={css.chartContainer}
        ref={(node) => {
          ref.current = node;
        }}
      />
    </Widget>
  );
};

export default ChartWidget;
