import React, { ReactElement, useEffect, useRef } from 'react';
import useChange, { useValue, useSilent } from 'use-change';
import * as api from '../../../api';
import useDepsUpdateEffect from '../../../hooks/useDepsUpdateEffect';
import CandlestickChart from '../../../lib/CandlestickChart';
import { RootStore } from '../../../store';

import Widget from '../../layout/Widget';

import css from './style.css';

const intervals: api.CandlestickChartInterval[] = ['1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '12h', '1d'];

const ChartWidget = (): ReactElement => {
  const [interval, setCandleInterval] = useChange(({ persistent }: RootStore) => persistent, 'interval');
  const ref = useRef<HTMLDivElement | null>(null);
  const candleChartRef = useRef<CandlestickChart | null>(null);
  const candles = useValue(({ market }: RootStore) => market, 'candles');
  const currentSymbolInfo = useValue(({ market }: RootStore) => market, 'currentSymbolInfo');
  const symbol = useValue(({ persistent }: RootStore) => persistent, 'symbol');
  const position = useValue(({ trading }: RootStore) => trading, 'tradingPositions').find((pos) => pos.symbol === symbol) ?? null;
  const [alerts, setAlerts] = useChange(({ persistent }: RootStore) => persistent, 'alerts');
  const limitBuyPrice = useValue(({ trading }: RootStore) => trading, 'limitBuyPrice');
  const limitSellPrice = useValue(({ trading }: RootStore) => trading, 'limitSellPrice');
  const shouldShowLimitBuyPriceLine = useValue(({ trading }: RootStore) => trading, 'shouldShowLimitBuyPriceLine');
  const shouldShowLimitSellPriceLine = useValue(({ trading }: RootStore) => trading, 'shouldShowLimitSellPriceLine');
  const tradingType = useValue(({ persistent }: RootStore) => persistent, 'tradingType');
  const updateDrafts = useSilent(({ trading }: RootStore) => trading, 'updateDrafts');

  useDepsUpdateEffect(() => {
    if (candleChartRef.current) {
      candleChartRef.current.update({ pricePrecision: currentSymbolInfo?.pricePrecision ?? 1 });
    }
  }, [currentSymbolInfo?.pricePrecision]);

  useDepsUpdateEffect(() => {
    if (candleChartRef.current) candleChartRef.current.update({ candles });
  }, [candles]);

  useDepsUpdateEffect(() => {
    if (candleChartRef.current) candleChartRef.current.update({ symbol });
  }, [symbol]);

  useDepsUpdateEffect(() => {
    if (candleChartRef.current) candleChartRef.current.update({ interval });
  }, [interval]);

  useDepsUpdateEffect(() => {
    if (candleChartRef.current) candleChartRef.current.update({ position });
  }, [position]);

  useDepsUpdateEffect(() => {
    if (candleChartRef.current) {
      switch (tradingType) {
        case 'LIMIT': {
          candleChartRef.current.update({
            canCreateDraftLines: true,
            buyDraftPrice: limitBuyPrice,
            sellDraftPrice: limitSellPrice,
            shouldShowBuyPrice: shouldShowLimitBuyPriceLine,
            shouldShowSellPrice: shouldShowLimitSellPriceLine,
          });
          break;
        }

        default: {
          candleChartRef.current.update({
            canCreateDraftLines: false,
            shouldShowBuyPrice: false,
            shouldShowSellPrice: false,
          });
        }
      }
    }
  }, [
    limitBuyPrice, limitSellPrice, shouldShowLimitBuyPriceLine,
    shouldShowLimitSellPriceLine, tradingType,
  ]);

  useEffect(() => {
    if (ref.current && !candleChartRef.current) {
      candleChartRef.current = new CandlestickChart(ref.current, {
        onUpdateAlerts: (d: number[]) => setAlerts(d),
        onUpdateDrafts: updateDrafts,
        alerts,
        symbol,
        interval,
        draftPriceItems: [],
        pricePrecision: currentSymbolInfo?.pricePrecision ?? 0,
      });
      candleChartRef.current.update({ candles });
    }
  });

  return (
    <Widget title="Chart">
      <div className={`nav nav-pills ${css.intervals}`}>
        {intervals.map((intervalsItem, index) => (
          <div
            role="button"
            tabIndex={index}
            className={`nav-item cursor-pointer ${css.intervalItem}`}
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
