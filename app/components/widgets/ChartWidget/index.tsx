import React, {
  ReactElement, useEffect, useMemo, useRef, useState,
} from 'react';
import useChange, { useValue, useGet } from 'use-change';
import { futuresIntervals } from '../../../api';
import useMultiValue from '../../../hooks/useMultiValue';
import CandlestickChart from '../../../lib/CandlestickChart';
import {
  ACCOUNT, CUSTOMIZATION, MARKET, PERSISTENT, TRADING,
} from '../../../store';

import Widget from '../../layout/Widget';
import ChartSettings from './ChartSettings';

import css from './style.css';

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
    isCurrentSymbolMarginTypeIsolated, currentSymbolLeverage,
    openPositions, openOrders,
    limitBuyPrice, limitSellPrice, stopBuyPrice, stopSellPrice,
    shouldShowLimitBuyPriceLine, shouldShowLimitSellPriceLine,
    shouldShowStopBuyDraftPriceLine, shouldShowStopSellDraftPriceLine,
    exactSizeLimitBuyStr, exactSizeLimitSellStr,
    exactSizeStopLimitBuyStr, exactSizeStopLimitSellStr,
    // silent values
    updateDrafts, createOrderFromDraft, limitOrder, cancelOrder,
    calculateSizeFromString, calculateLiquidationPrice, getPseudoPosition,
  } = useMultiValue(TRADING, [
    'isCurrentSymbolMarginTypeIsolated', 'currentSymbolLeverage',
    'openPositions', 'openOrders',
    'limitBuyPrice', 'limitSellPrice', 'stopBuyPrice', 'stopSellPrice',
    'shouldShowLimitBuyPriceLine', 'shouldShowLimitSellPriceLine',
    'shouldShowStopBuyDraftPriceLine', 'shouldShowStopSellDraftPriceLine',
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

  useMemo(() => { // TODO dirty fix useMemo works more robust than useEffect for some reason
    // TODO dirty fix to ignore lastPrice changes and update orders when length or leverage changed
    candleChart?.update({ orders });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders.length, orders[0]?.leverage, orders[0]?.marginType, candleChart]);

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

  useMemo(() => {
    if (candleChart) {
      switch (tradingType) {
        case 'LIMIT': {
          candleChart.update({
            isCurrentSymbolMarginTypeIsolated,
            currentSymbolLeverage,

            canCreateDraftLines: true,

            buyDraftPrice: limitBuyPrice,
            sellDraftPrice: limitSellPrice,
            buyDraftSize: calculateSizeFromString(symbol, exactSizeLimitBuyStr),
            sellDraftSize: calculateSizeFromString(symbol, exactSizeLimitSellStr),
            stopBuyDraftPrice: 0,
            stopSellDraftPrice: 0,

            shouldShowBuyDraftPrice: shouldShowLimitBuyPriceLine,
            shouldShowSellDraftPrice: shouldShowLimitSellPriceLine,
            shouldShowStopBuyDraftPrice: false,
            shouldShowStopSellDraftPrice: false,
          });
          break;
        }

        case 'STOP': {
          candleChart.update({
            isCurrentSymbolMarginTypeIsolated,
            currentSymbolLeverage,

            canCreateDraftLines: true,

            buyDraftPrice: limitBuyPrice,
            sellDraftPrice: limitSellPrice,
            buyDraftSize: calculateSizeFromString(symbol, exactSizeStopLimitBuyStr),
            sellDraftSize: calculateSizeFromString(symbol, exactSizeStopLimitSellStr),
            stopBuyDraftPrice: stopBuyPrice,
            stopSellDraftPrice: stopSellPrice,

            shouldShowBuyDraftPrice: shouldShowLimitBuyPriceLine,
            shouldShowSellDraftPrice: shouldShowLimitSellPriceLine,
            shouldShowStopBuyDraftPrice: shouldShowStopBuyDraftPriceLine,
            shouldShowStopSellDraftPrice: shouldShowStopSellDraftPriceLine,
          });
          break;
        }

        case 'STOP_MARKET': {
          candleChart.update({
            isCurrentSymbolMarginTypeIsolated,
            currentSymbolLeverage,

            canCreateDraftLines: true,

            buyDraftPrice: 0,
            sellDraftPrice: 0,
            buyDraftSize: 0,
            sellDraftSize: 0,
            stopBuyDraftPrice: stopBuyPrice,
            stopSellDraftPrice: stopSellPrice,

            shouldShowBuyDraftPrice: false,
            shouldShowSellDraftPrice: false,
            shouldShowStopBuyDraftPrice: shouldShowStopBuyDraftPriceLine,
            shouldShowStopSellDraftPrice: shouldShowStopSellDraftPriceLine,
          });
          break;
        }

        default: { // MARKET
          candleChart.update({
            isCurrentSymbolMarginTypeIsolated,
            currentSymbolLeverage,

            canCreateDraftLines: false,

            buyDraftPrice: 0,
            sellDraftPrice: 0,
            buyDraftSize: 0,
            sellDraftSize: 0,
            stopBuyDraftPrice: 0,
            stopSellDraftPrice: 0,

            shouldShowBuyDraftPrice: false,
            shouldShowSellDraftPrice: false,
            shouldShowStopBuyDraftPrice: false,
            shouldShowStopSellDraftPrice: false,
          });
        }
      }
    }
  }, [
    symbol, limitBuyPrice, limitSellPrice,
    shouldShowLimitBuyPriceLine, shouldShowLimitSellPriceLine,
    shouldShowStopBuyDraftPriceLine, shouldShowStopSellDraftPriceLine,
    stopBuyPrice, stopSellPrice, tradingType, candleChart,
    calculateSizeFromString, exactSizeLimitBuyStr, exactSizeLimitSellStr,
    exactSizeStopLimitBuyStr, exactSizeStopLimitSellStr,
    isCurrentSymbolMarginTypeIsolated, currentSymbolLeverage,
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
        calculateLiquidationPrice,
        getPseudoPosition,
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
        {futuresIntervals.map((intervalsItem, index) => (
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
