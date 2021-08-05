import React, {
  ReactElement, useEffect, useMemo, useRef, useState,
} from 'react';
import useChange, { useValue, useGet } from 'use-change';
import * as api from '../../../api';
import useMultiValue from '../../../hooks/useMultiValue';
import CandlestickChart from '../../../lib/CandlestickChart';
import {
  ACCOUNT, CUSTOMIZATION, MARKET, PERSISTENT, TRADING,
} from '../../../store';

import Widget from '../../layout/Widget';
import ChartSettings from './ChartSettings';

import css from './style.css';

const intervals: api.CandlestickChartInterval[] = ['1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '12h', '1d'];

const ChartWidget = ({ title, id }: { title: string; id: string; }): ReactElement => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [candleChart, setCandleChart] = useState<CandlestickChart | null>(null);

  const totalWalletBalance = useValue(ACCOUNT, 'totalWalletBalance');

  const customPriceLines = useValue(CUSTOMIZATION, 'customPriceLines');

  const candles = useValue(MARKET, 'candles');
  const currentSymbolInfo = useValue(MARKET, 'currentSymbolInfo');

  const getSymbol = useGet(PERSISTENT, 'symbol');
  const [interval, setCandleInterval] = useChange(PERSISTENT, 'interval');
  const [symbolAlerts, setSymbolAlerts] = useChange(PERSISTENT, 'symbolAlerts');
  const {
    symbol, tradingType, chartPaddingTopPercent,
    chartPaddingBottomPercent, chartPaddingRightPercent,
  } = useMultiValue(PERSISTENT, [
    'symbol', 'tradingType', 'chartPaddingTopPercent',
    'chartPaddingBottomPercent', 'chartPaddingRightPercent',
  ]);

  const getOpenOrders = useGet(TRADING, 'openOrders');
  const {
    openPositions, openOrders,
    limitBuyPrice, limitSellPrice, stopBuyPrice, stopSellPrice,
    shouldShowLimitBuyPriceLine, shouldShowLimitSellPriceLine,
    shouldShowStopBuyPriceLine, shouldShowStopSellPriceLine,
    exactSizeLimitBuyStr, exactSizeLimitSellStr,
    exactSizeStopLimitBuyStr, exactSizeStopLimitSellStr,
    // silent values
    updateDrafts, currentSymbolLeverage, createOrderFromDraft, limitOrder, cancelOrder,
    calculateSizeFromString,
  } = useMultiValue(TRADING, [
    'openPositions', 'openOrders',
    'limitBuyPrice', 'limitSellPrice', 'stopBuyPrice', 'stopSellPrice',
    'shouldShowLimitBuyPriceLine', 'shouldShowLimitSellPriceLine',
    'shouldShowStopBuyPriceLine', 'shouldShowStopSellPriceLine',
    'exactSizeLimitBuyStr', 'exactSizeLimitSellStr',
    'exactSizeStopLimitBuyStr', 'exactSizeStopLimitSellStr',
  ]);

  const position = openPositions.find((pos) => pos.symbol === symbol) ?? null;

  const orders = useMemo(
    () => openOrders.filter((order) => order.symbol === symbol),
    [openOrders, symbol],
  );
  const alerts = symbolAlerts[symbol];

  useEffect(() => {
    candleChart?.update({ currentSymbolLeverage });
  }, [currentSymbolLeverage, candleChart]);

  useEffect(() => {
    candleChart?.update({ currentSymbolInfo });
  }, [currentSymbolInfo, candleChart]);

  useEffect(() => {
    candleChart?.update({ totalWalletBalance });
  }, [totalWalletBalance, candleChart]);

  useEffect(() => {
    candleChart?.update({ candles });
  }, [candles, candleChart]);

  useEffect(() => {
    candleChart?.update({ position });
  }, [position, candleChart]);

  useEffect(() => {
    // TODO dirty fix to ignore fast lastPrice changes and update orders when length changed
    candleChart?.update({ orders });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders.length, candleChart]);

  useEffect(() => {
    candleChart?.update({ alerts: alerts || [] });
  }, [alerts, candleChart]);

  useEffect(() => {
    candleChart?.update({ customPriceLines });
  }, [customPriceLines, candleChart]);

  useEffect(() => {
    candleChart?.update({
      paddingPercents: {
        top: chartPaddingTopPercent,
        bottom: chartPaddingBottomPercent,
        right: chartPaddingRightPercent,
      },
    });
  }, [
    customPriceLines, candleChart, chartPaddingTopPercent,
    chartPaddingBottomPercent, chartPaddingRightPercent,
  ]);

  useEffect(() => {
    if (candleChart) {
      switch (tradingType) {
        case 'LIMIT': {
          candleChart.update({
            canCreateDraftLines: true,

            buyDraftPrice: limitBuyPrice,
            sellDraftPrice: limitSellPrice,
            buyDraftSize: calculateSizeFromString(exactSizeLimitBuyStr),
            sellDraftSize: calculateSizeFromString(exactSizeLimitSellStr),
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
          candleChart.update({
            canCreateDraftLines: true,

            buyDraftPrice: limitBuyPrice,
            sellDraftPrice: limitSellPrice,
            buyDraftSize: calculateSizeFromString(exactSizeStopLimitBuyStr),
            sellDraftSize: calculateSizeFromString(exactSizeStopLimitSellStr),
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
          candleChart.update({
            canCreateDraftLines: true,

            buyDraftPrice: 0,
            sellDraftPrice: 0,
            buyDraftSize: 0,
            sellDraftSize: 0,
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
          candleChart.update({
            canCreateDraftLines: false,

            buyDraftPrice: 0,
            sellDraftPrice: 0,
            buyDraftSize: 0,
            sellDraftSize: 0,
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
    shouldShowLimitSellPriceLine, shouldShowStopBuyPriceLine, shouldShowStopSellPriceLine,
    stopBuyPrice, stopSellPrice, tradingType, candleChart, calculateSizeFromString,
    exactSizeLimitBuyStr, exactSizeLimitSellStr,
    exactSizeStopLimitBuyStr, exactSizeStopLimitSellStr,
  ]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (ref.current && !candleChart) {
      const instance = new CandlestickChart(ref.current, {
        onUpdateAlerts: (d: number[]) => setSymbolAlerts((v) => ({
          ...v,
          [`${getSymbol()}`]: d,
        })),
        onUpdateDrafts: updateDrafts,
        onClickDraftCheck: createOrderFromDraft,
        alerts: alerts || [],
        draftPriceItems: [],
        pricePrecision: currentSymbolInfo?.pricePrecision ?? 0,
        paddingPercents: {
          top: chartPaddingTopPercent,
          bottom: chartPaddingBottomPercent,
          right: chartPaddingRightPercent,
        },
        onDragLimitOrder: async (orderId: number, price: number) => {
          const order = getOpenOrders().find((orderItem) => orderId === orderItem.orderId);
          if (order) {
            if (price === order.price) return;
            if (await cancelOrder(order.symbol, orderId)) {
              await limitOrder({
                side: order.side,
                quantity: order.origQty,
                price,
                symbol: order.symbol,
                reduceOnly: order.reduceOnly,
                postOnly: order.timeInForce === 'GTX',
              });
            }
          }
        },
        onCancelOrder: async (orderId: number) => {
          const order = getOpenOrders().find((orderItem) => orderId === orderItem.orderId);
          if (order) await cancelOrder(order.symbol, orderId);
        },
      });

      instance.update({ candles });

      setCandleChart(instance);
    }
  });

  return (
    <Widget
      id={id}
      title={title}
      settings={({ listenSettingsCancel, listenSettingsSave }) => (
        <ChartSettings
          listenSettingsCancel={listenSettingsCancel}
          listenSettingsSave={listenSettingsSave}
        />
      )}
    >
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
        ref={(node) => { ref.current = node; }}
      />
    </Widget>
  );
};

export default ChartWidget;
