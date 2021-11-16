import { format } from 'd3-format';
import { capitalize, uniq } from 'lodash';
import React, { ReactElement, useCallback, useMemo } from 'react';
import { Trash } from 'react-bootstrap-icons';
import { Badge, Button, Table } from 'reactstrap';
import { useSet, useSilent, useValue } from 'use-change';
import { PERSISTENT, TRADING } from '../../../store';

const formatNumber = (n: number, ignorePrecision?: boolean) => format(n < 10 && !ignorePrecision ? ',.4f' : ',.2f')(n);
const formatPercent = format(',.1f');

const Orders = (): ReactElement => {
  const openOrders = useValue(TRADING, 'openOrders');
  const allSymbolsPositionRisk = useValue(TRADING, 'allSymbolsPositionRisk');
  const cancelOrder = useSilent(TRADING, 'cancelOrder');
  const cancelAllOrders = useSilent(TRADING, 'cancelAllOrders');
  const setSymbol = useSet(PERSISTENT, 'symbol');
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

  return (
    <Table className="align-middle">
      <thead>
        <tr>
          <th>
            Order Asset
          </th>
          <th>
            Type
          </th>
          <th>
            Size
          </th>
          <th>
            Last Price
          </th>
          <th>
            Price
          </th>
          <th>
            Filled
          </th>
          <th>
            Stop Price
          </th>
          <th>
            Reduce
          </th>
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
        </tr>
      </thead>
      <tbody>
        {openOrders.sort((a, b) => {
          if (a.symbol === b.symbol) {
            return a.price < b.price ? 1 : -1;
          }
          return a.symbol > b.symbol ? 1 : -1;
        }).map(({
          symbol, side, type, origQty, lastPrice, price, clientOrderId,
          executedQty, stopPrice, reduceOnly, orderId, isCanceled,
        }) => (
          <tr key={orderId}>
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
            <td>{capitalize(type.toLowerCase()).replaceAll('_', ' ')}</td>
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
            <td>
              {formatNumber(lastPrice)}
              {' '}
              ₮
            </td>
            <td>
              {!price && stopPrice ? <>&mdash;</> : (
                <>
                  {formatNumber(price)}
                  &nbsp;₮
                </>
              )}
            </td>
            <td>
              {console.log(`executedQty for order ${orderId} that user sees`, executedQty)}
              {executedQty}
              {' '}
              (
              {formatPercent(origQty ? (executedQty / origQty) * 100 : 0)}
              %)
            </td>
            <td>
              {stopPrice ? (
                <>
                  {stopPrice}
                  &nbsp;₮
                </>
              ) : <>&mdash;</>}
            </td>
            <td>{reduceOnly ? 'Yes' : 'No'}</td>
            <td>
              <Button
                color="link"
                className="text-muted px-0 py-0"
                disabled={isCanceled}
                onClick={() => onCancel(symbol, clientOrderId)}
              >
                {isCanceled ? '...' : <Trash size={18} />}
              </Button>
            </td>
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
  );
};

export default Orders;
