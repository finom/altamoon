import React, {
  ReactElement, useEffect, useMemo, useRef,
} from 'react';
import useChange, { useValue, useSilent } from 'use-change';
import * as api from '../../../api';
import useDepsUpdateEffect from '../../../hooks/useDepsUpdateEffect';
import CandlestickChart from '../../../lib/CandlestickChart';
import { RootStore } from '../../../store';

import Widget from '../../layout/Widget';

import css from './style.css';

const intervals: api.CandlestickChartInterval[] = ['1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '12h', '1d'];

const TRADING = ({ trading }: RootStore) => trading;
const PERSISTENT = ({ persistent }: RootStore) => persistent;
const MARKET = ({ market }: RootStore) => market;

const ChartWidget = ({ title, id }: { title: string; id: string; }): ReactElement => {
  const ref = useRef<HTMLDivElement | null>(null);
  const candleChartRef = useRef<CandlestickChart | null>(null);

  const candles = useValue(MARKET, 'candles');
  const currentSymbolInfo = useValue(MARKET, 'currentSymbolInfo');
  const symbol = useValue(PERSISTENT, 'symbol');

  const [interval, setCandleInterval] = useChange(PERSISTENT, 'interval');
  const [alerts, setAlerts] = useChange(PERSISTENT, 'alerts');
  const tradingType = useValue(PERSISTENT, 'tradingType');

  const position = useValue(TRADING, 'tradingPositions').find((pos) => pos.symbol === symbol) ?? null;
  const openOrders = useValue(TRADING, 'openOrders');
  const updateDrafts = useSilent(TRADING, 'updateDrafts');
  const limitBuyPrice = useValue(TRADING, 'limitBuyPrice');
  const limitSellPrice = useValue(TRADING, 'limitSellPrice');
  const stopBuyPrice = useValue(TRADING, 'stopBuyPrice');
  const stopSellPrice = useValue(TRADING, 'stopSellPrice');
  const shouldShowLimitBuyPriceLine = useValue(TRADING, 'shouldShowLimitBuyPriceLine');
  const shouldShowLimitSellPriceLine = useValue(TRADING, 'shouldShowLimitSellPriceLine');
  const shouldShowStopBuyPriceLine = useValue(TRADING, 'shouldShowStopBuyPriceLine');
  const shouldShowStopSellPriceLine = useValue(TRADING, 'shouldShowStopSellPriceLine');
  const orders = useMemo(
    () => openOrders.filter((order) => order.symbol === symbol),
    [openOrders, symbol],
  );

  useDepsUpdateEffect(() => {
    if (candleChartRef.current) {
      candleChartRef.current.update({ pricePrecision: currentSymbolInfo?.pricePrecision ?? 1 });
    }
  }, [currentSymbolInfo?.pricePrecision]);

  useDepsUpdateEffect(() => {
    if (candleChartRef.current) candleChartRef.current.update({ candles });
  }, [candles]);

  useDepsUpdateEffect(() => {
    if (candleChartRef.current) candleChartRef.current.update({ position });
  }, [position]);

  useDepsUpdateEffect(() => {
    if (candleChartRef.current) candleChartRef.current.update({ orders });
  }, [orders]);

  useDepsUpdateEffect(() => {
    if (candleChartRef.current) {
      switch (tradingType) {
        case 'LIMIT': {
          candleChartRef.current.update({
            canCreateDraftLines: true,

            buyDraftPrice: limitBuyPrice,
            sellDraftPrice: limitSellPrice,
            stopBuyDraftPrice: 0,
            stopSellDraftPrice: 0,

            shouldShowBuyPrice: shouldShowLimitBuyPriceLine,
            shouldShowSellPrice: shouldShowLimitSellPriceLine,
            shouldShowStopBuyPrice: false,
            shouldShowStopSellPrice: false,
          });
          break;
        }

        case 'STOP': {
          candleChartRef.current.update({
            canCreateDraftLines: true,

            buyDraftPrice: limitBuyPrice,
            sellDraftPrice: limitSellPrice,
            stopBuyDraftPrice: stopBuyPrice,
            stopSellDraftPrice: stopSellPrice,

            shouldShowBuyPrice: shouldShowLimitBuyPriceLine,
            shouldShowSellPrice: shouldShowLimitSellPriceLine,
            shouldShowStopBuyPrice: shouldShowStopBuyPriceLine,
            shouldShowStopSellPrice: shouldShowStopSellPriceLine,
          });
          break;
        }

        case 'STOP_MARKET': {
          candleChartRef.current.update({
            canCreateDraftLines: true,

            buyDraftPrice: 0,
            sellDraftPrice: 0,
            stopBuyDraftPrice: stopBuyPrice,
            stopSellDraftPrice: stopSellPrice,

            shouldShowBuyPrice: false,
            shouldShowSellPrice: false,
            shouldShowStopBuyPrice: shouldShowStopBuyPriceLine,
            shouldShowStopSellPrice: shouldShowStopSellPriceLine,
          });
          break;
        }

        default: {
          candleChartRef.current.update({
            canCreateDraftLines: false,

            buyDraftPrice: 0,
            sellDraftPrice: 0,
            stopBuyDraftPrice: 0,
            stopSellDraftPrice: 0,

            shouldShowBuyPrice: false,
            shouldShowSellPrice: false,
            shouldShowStopBuyPrice: false,
            shouldShowStopSellPrice: false,
          });
        }
      }
    }
  }, [
    limitBuyPrice, limitSellPrice, shouldShowLimitBuyPriceLine,
    shouldShowLimitSellPriceLine, shouldShowStopBuyPriceLine,
    shouldShowStopSellPriceLine, stopBuyPrice, stopSellPrice, tradingType,
  ]);

  useEffect(() => {
    if (ref.current && !candleChartRef.current) {
      candleChartRef.current = new CandlestickChart(ref.current, {
        onUpdateAlerts: (d: number[]) => setAlerts(d),
        onUpdateDrafts: updateDrafts,
        alerts,
        draftPriceItems: [],
        pricePrecision: currentSymbolInfo?.pricePrecision ?? 0,
      });
      candleChartRef.current.update({ candles });
    }
  });

  return (
    <Widget id={id} title={title}>
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
