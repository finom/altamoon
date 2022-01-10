import { format } from 'd3-format';
import { capitalize, uniq } from 'lodash';
import React, { ReactElement, useCallback, useMemo } from 'react';
import { Trash } from 'react-bootstrap-icons';
import { Badge, Button, Table } from 'reactstrap';
import useChange, { useSet, useSilent, useValue } from 'use-change';
import useValueDebounced from '../../../hooks/useValueDebounced';
import tooltipRef from '../../../lib/tooltipRef';
import { ACCOUNT, PERSISTENT, TRADING } from '../../../store';
import ColumnSelector, { ColumnSelectorItem } from './ColumnSelector';

const formatNumber = (n: number, ignorePrecision?: boolean) => format(n < 10 && !ignorePrecision ? ',.4f' : ',.2f')(n);
const formatPercent = format(',.1f');

const Orders = (): ReactElement => {
  const openOrders = useValue(TRADING, 'openOrders');
  const ordersToBeCreated = useValue(TRADING, 'ordersToBeCreated');

  const allSymbolsPositionRisk = useValue(TRADING, 'allSymbolsPositionRisk');
  const listenedLastPrices = useValueDebounced(TRADING, 'listenedLastPrices');
  const cancelOrder = useSilent(TRADING, 'cancelOrder');
  const cancelAllOrders = useSilent(TRADING, 'cancelAllOrders');
  const setSymbol = useSet(PERSISTENT, 'symbol');
  const [hiddenOrderColumns, setHiddenOrderColumns] = useChange(PERSISTENT, 'hiddenOrderColumns');

  const totalWalletBalance = useValue(ACCOUNT, 'totalWalletBalance');
  const isAllOrdersCanceled = useMemo(
    () => !openOrders.length || openOrders.every(({ isCanceled }) => isCanceled),
    [openOrders],
  );

  const onCancel = useCallback(async (symbol: string, clientOrderId: string) => {
    await cancelOrder(symbol, clientOrderId);
  }, [cancelOrder]);

  const onCancelAll = useCallback(async () => {
    await Promise.all(uniq(openOrders.map(({ symbol }) => symbol)).map(cancelAllOrders));
  }, [cancelAllOrders, openOrders]);

  const columns = useMemo<readonly ColumnSelectorItem[]>(() => [{
    id: 'symbol',
    display: 'Order',
  }, {
    id: 'type',
    display: 'Type',
  }, {
    id: 'size',
    display: 'Size',
  }, {
    id: 'margin',
    display: 'Margin',
    title: 'Estimated Margin in "Isolated" mode',
  }, {
    id: 'last_price',
    display: 'Last Price',
  }, {
    id: 'price',
    display: 'Price',
  }, {
    id: 'filled',
    display: 'Filled',
  }, {
    id: 'stop_price',
    display: 'Stop Price',
  }, {
    id: 'reduce',
    display: 'Reduce',
  }], []);

  return (
    <>

      <Table className="align-middle">
        <thead>
          <tr>
            {columns.map(({ id, display, title }) => (
              !hiddenOrderColumns.includes(id) ? (
                <th key={id} ref={title ? tooltipRef({ title }) : undefined}>
                  {display}
                </th>
              ) : null
            ))}
            <th style={{ width: '100px' }}>
              <Button
                color="link"
                className="text-muted px-0 py-0"
                disabled={isAllOrdersCanceled}
                onClick={onCancelAll}
              >
                Cancel all
              </Button>
            </th>
            <td className="p-0">
              <ColumnSelector
                id="order_column_selector"
                columns={columns}
                hiddenColumnIds={hiddenOrderColumns}
                setHiddenColumnIds={setHiddenOrderColumns}
              />
            </td>
          </tr>
        </thead>
        <tbody>
          {[...openOrders, ...ordersToBeCreated].sort((a, b) => {
            if (a.symbol === b.symbol) {
              return a.price < b.price ? 1 : -1;
            }
            return a.symbol > b.symbol ? 1 : -1;
          }).map(({
            symbol, side, type, origQty, price, clientOrderId, leverage,
            executedQty, stopPrice, reduceOnly, isCanceled, orderId,
          }) => (
            <tr key={clientOrderId} className={isCanceled || !orderId ? 'o-50' : undefined}>
              {!hiddenOrderColumns.includes('symbol') && (
              <td>
                <span
                  className="link-alike"
                  onClick={() => setSymbol(symbol)}
                  onKeyDown={() => setSymbol(symbol)}
                  role="button"
                  tabIndex={0}
                >
                  {symbol.slice(0, -4)}
                </span>
                {' '}
              &nbsp;
                <Badge color={side === 'BUY' ? 'buy' : 'sell'}>
                  {allSymbolsPositionRisk[symbol]?.leverage ?? 0}
                  x
                </Badge>
              </td>
              )}
              {!hiddenOrderColumns.includes('type') && (<td>{capitalize(type.toLowerCase()).replaceAll('_', ' ')}</td>)}
              {!hiddenOrderColumns.includes('size') && (
              <td>
                {origQty}
                {' '}
                {!price && stopPrice ? '' : (
                  <>
                    (
                    {formatNumber(origQty * price, true)}
                  &nbsp;₮)
                  </>
                )}
              </td>
              )}
              {!hiddenOrderColumns.includes('margin') && (
              <td>
                {formatNumber((origQty - executedQty) * (price / leverage))}
                {' '}
                ₮
                {' '}
                (
                {formatPercent(
                  (((origQty - executedQty) * (price / leverage)) / totalWalletBalance) * 100,
                )}
                %)
              </td>
              )}
              {!hiddenOrderColumns.includes('last_price') && (
              <td>
                {formatNumber(listenedLastPrices[symbol])}
                {' '}
                ₮
              </td>
              )}
              {!hiddenOrderColumns.includes('price') && (
              <td>
                {!price && stopPrice ? <>&mdash;</> : (
                  <>
                    {formatNumber(price)}
                  &nbsp;₮
                  </>
                )}
              </td>
              )}
              {!hiddenOrderColumns.includes('filled') && (
              <td>
                {executedQty}
                {' '}
                (
                {formatPercent(origQty ? (executedQty / origQty) * 100 : 0)}
                %)
              </td>
              )}
              {!hiddenOrderColumns.includes('stop_price') && (
              <td>
                {stopPrice ? (
                  <>
                    {stopPrice}
                  &nbsp;₮
                  </>
                ) : <>&mdash;</>}
              </td>
              )}
              {!hiddenOrderColumns.includes('reduce') && (<td>{reduceOnly ? 'Yes' : 'No'}</td>)}
              <td>
                <Button
                  color="link"
                  className="text-muted px-0 py-0"
                  disabled={isCanceled || !orderId}
                  onClick={() => onCancel(symbol, clientOrderId)}
                >
                  {isCanceled ? '...' : <Trash size={18} />}
                </Button>
              </td>
              <td />
            </tr>
          ))}
        </tbody>
        {!openOrders.length && (
        <tfoot>
          <tr>
            <td colSpan={100} align="center" className="text-muted"><em>You don&apos;t have open orders or they aren&apos;t loaded yet</em></td>
          </tr>
        </tfoot>
        )}
      </Table>
    </>
  );
};

export default Orders;
