import React, {
  ReactElement, useEffect, useMemo, useRef, useState,
} from 'react';
import useChange, { useValue, useGet } from 'use-change';

import { futuresIntervals } from '../../../api';
import useMultiValue from '../../../hooks/useMultiValue';
import CandlestickChart from './CandlestickChart';
import {
  ACCOUNT, CUSTOMIZATION, MARKET, PERSISTENT, TRADING,
} from '../../../store';
import FormSwitch from '../../controls/FormSwitch';

import Widget from '../../layout/Widget';
import ChartSettings from './ChartSettings';

import css from './style.css';
import ChartInfo from './ChartInfo';

interface Props {
  title: string;
  id: string;
}

const ChartWidget = ({ title, id }: Props): ReactElement => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [candleChart, setCandleChart] = useState<CandlestickChart | null>(null);

  const totalWalletBalance = useValue(ACCOUNT, 'totalWalletBalance');
  const leverageBrackets = useValue(ACCOUNT, 'leverageBrackets');

  const customPriceLines = useValue(CUSTOMIZATION, 'customPriceLines');

  const getCandles = useGet(MARKET, 'candles');
  const currentSymbolInfo = useValue(MARKET, 'currentSymbolInfo');

  const getSymbol = useGet(PERSISTENT, 'symbol');
  const [interval, setCandleInterval] = useChange(PERSISTENT, 'interval');
  const [symbolAlerts, setSymbolAlerts] = useChange(PERSISTENT, 'symbolAlerts');
  const [shouldChartShowOrders, setShouldChartShowOrders] = useChange(PERSISTENT, 'shouldChartShowOrders');
  const chartOrdersNumber = useValue(PERSISTENT, 'chartOrdersNumber');

  const {
    symbol, tradingType, chartPaddingTopPercent,
    chartPaddingBottomPercent, chartPaddingRightPercent,
  } = useMultiValue(PERSISTENT, [
    'symbol', 'tradingType', 'chartPaddingTopPercent',
    'chartPaddingBottomPercent', 'chartPaddingRightPercent',
  ]);
  const getOpenOrders = useGet(TRADING, 'openOrders');
  const getOpenPositions = useGet(TRADING, 'openPositions');
  const {
    isCurrentSymbolMarginTypeIsolated, currentSymbolLeverage,
    limitBuyPrice, limitSellPrice, stopBuyPrice, stopSellPrice,
    shouldShowLimitBuyPriceLine, shouldShowLimitSellPriceLine,
    shouldShowStopBuyDraftPriceLine, shouldShowStopSellDraftPriceLine,
    exactSizeBuyStr, exactSizeSellStr,
    currentSymbolAllOrders, ordersToBeCreated,
    // silent values
    updateDrafts, createOrderFromDraft, limitOrder, cancelOrder, calculateQuantity,
    calculateSizeFromString, calculateLiquidationPrice, getPseudoPosition,
  } = useMultiValue(TRADING, [
    'isCurrentSymbolMarginTypeIsolated', 'currentSymbolLeverage',
    'limitBuyPrice', 'limitSellPrice', 'stopBuyPrice', 'stopSellPrice',
    'shouldShowLimitBuyPriceLine', 'shouldShowLimitSellPriceLine',
    'shouldShowStopBuyDraftPriceLine', 'shouldShowStopSellDraftPriceLine',
    'exactSizeBuyStr', 'exactSizeSellStr',
    'currentSymbolAllOrders', 'ordersToBeCreated',
  ]);

  const alerts = symbolAlerts[symbol];

  useEffect(() => {
    candleChart?.update({ currentSymbolInfo });
  }, [currentSymbolInfo, candleChart]);

  useEffect(() => {
    candleChart?.update({ totalWalletBalance });
  }, [totalWalletBalance, candleChart]);

  useEffect(() => {
    candleChart?.update({ leverageBrackets });
  }, [leverageBrackets, candleChart]);

  useMemo(() => {
    candleChart?.update({ ordersToBeCreated });
  }, [candleChart, ordersToBeCreated]);

  useEffect(() => {
    candleChart?.update({ alerts: alerts || [] });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alerts && alerts.join('/'), candleChart]); // update alerts when they actually changed

  useEffect(() => {
    candleChart?.update({ customPriceLines });
  }, [customPriceLines, candleChart]);

  useEffect(() => {
    const isAllOrdersRelevant = !currentSymbolAllOrders.length
      || currentSymbolAllOrders[0].symbol === symbol;
    candleChart?.update({
      filledOrders: isAllOrdersRelevant && shouldChartShowOrders
        ? currentSymbolAllOrders
          .filter(({ status }) => ['PARTIALLY_FILLED', 'FILLED'].includes(status))
          .slice(-chartOrdersNumber)
        : [],
    });
  }, [currentSymbolAllOrders, candleChart, symbol, shouldChartShowOrders, chartOrdersNumber]);

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

            buyDraftPrice: limitBuyPrice,
            sellDraftPrice: limitSellPrice,
            buyDraftSize: calculateSizeFromString(symbol, exactSizeBuyStr),
            sellDraftSize: calculateSizeFromString(symbol, exactSizeSellStr),
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

            buyDraftPrice: limitBuyPrice,
            sellDraftPrice: limitSellPrice,
            buyDraftSize: calculateSizeFromString(symbol, exactSizeBuyStr),
            sellDraftSize: calculateSizeFromString(symbol, exactSizeSellStr),
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

            buyDraftPrice: limitBuyPrice,
            sellDraftPrice: limitSellPrice,
            buyDraftSize: calculateSizeFromString(symbol, exactSizeBuyStr),
            sellDraftSize: calculateSizeFromString(symbol, exactSizeSellStr),
            stopBuyDraftPrice: stopBuyPrice,
            stopSellDraftPrice: stopSellPrice,

            shouldShowBuyDraftPrice: shouldShowLimitBuyPriceLine,
            shouldShowSellDraftPrice: shouldShowLimitSellPriceLine,
            shouldShowStopBuyDraftPrice: shouldShowStopBuyDraftPriceLine,
            shouldShowStopSellDraftPrice: shouldShowStopSellDraftPriceLine,
          });
          break;
        }

        default: { // 'MARKET'
          candleChart.update({
            isCurrentSymbolMarginTypeIsolated,
            currentSymbolLeverage,

            buyDraftPrice: limitBuyPrice,
            sellDraftPrice: limitSellPrice,
            buyDraftSize: calculateSizeFromString(symbol, exactSizeBuyStr),
            sellDraftSize: calculateSizeFromString(symbol, exactSizeSellStr),
            stopBuyDraftPrice: 0,
            stopSellDraftPrice: 0,

            shouldShowBuyDraftPrice: shouldShowLimitBuyPriceLine,
            shouldShowSellDraftPrice: shouldShowLimitSellPriceLine,
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
    calculateSizeFromString, exactSizeBuyStr, exactSizeSellStr,
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
        alerts: alerts || [],
        onUpdateDrafts: updateDrafts,
        onClickDraftCheck: createOrderFromDraft,
        draftPriceItems: [],
        pricePrecision: currentSymbolInfo?.pricePrecision ?? 0,
        paddingPercents: {
          top: chartPaddingTopPercent,
          bottom: chartPaddingBottomPercent,
          right: chartPaddingRightPercent,
        },
        calculateLiquidationPrice,
        calculateQuantity,
        getPseudoPosition,
        onDragLimitOrder: async (clientOrderId: string, price: number) => {
          const order = getOpenOrders()
            .find((orderItem) => clientOrderId === orderItem.clientOrderId);
          if (order) {
            if (price === order.price) return;
            if (await cancelOrder(order.symbol, clientOrderId)) {
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
        onCancelOrder: async (clientOrderId: string) => {
          const order = getOpenOrders()
            .find((orderItem) => clientOrderId === orderItem.clientOrderId);
          if (order) await cancelOrder(order.symbol, clientOrderId);
        },
      });

      instance.update({
        candles: getCandles(),
        orders: getOpenOrders(),
        position: getOpenPositions().find((pos) => pos.symbol === symbol) ?? null,
        leverageBrackets,
      });

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
      <label className={`float-end ${css.showOrders}`}>
        <FormSwitch
          className="d-inline-block align-middle"
          isChecked={shouldChartShowOrders}
          onChange={setShouldChartShowOrders}
        />
        {' '}
        Filled Orders
      </label>
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
      <ChartInfo />
      <div
        className={css.chartContainer}
        ref={(node) => { ref.current = node; }}
      />
    </Widget>
  );
};

export default ChartWidget;
