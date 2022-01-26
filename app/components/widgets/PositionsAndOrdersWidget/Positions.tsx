import { format } from 'd3-format';
import React, {
  ReactElement, useCallback, useMemo, useState,
} from 'react';
import { PencilSquare } from 'react-bootstrap-icons';
import { Badge, Button, Table } from 'reactstrap';
import useChange, { useSet, useSilent, useValue } from 'use-change';
import useValueDebounced from '../../../hooks/useValueDebounced';
import tooltipRef from '../../../lib/tooltipRef';
import { ACCOUNT, PERSISTENT, TRADING } from '../../../store';
import AdjustMarginModal from './AdjustMarginModal';
import ColumnSelector, { ColumnSelectorItem } from './ColumnSelector';

const formatNumber = (n: number, ignorePrecision?: boolean) => format(n < 10 && !ignorePrecision ? ',.4f' : ',.2f')(n);
const formatPercent = format(',.1f');

const textClassName = (value: number) => {
  if (!value) return '';

  return value > 0 ? 'text-success' : 'text-danger';
};

const Positions = (): ReactElement => {
  const openPositions = useValueDebounced(TRADING, 'openPositions');
  const closePosition = useSilent(TRADING, 'closePosition');

  const totalWalletBalance = useValue(ACCOUNT, 'totalWalletBalance');
  const setSymbol = useSet(PERSISTENT, 'symbol');
  const [hiddenPositionColumns, setHiddenPositionColumns] = useChange(PERSISTENT, 'hiddenPositionColumns');
  const [currentAdjustMarginSymbol, setCurrentAdjustMarginSymbol] = useState<string | null>(null);

  const onCloseMarket = useCallback(async (symbol: string) => {
    try { await closePosition(symbol); } catch {}
  }, [closePosition]);
  const closeAdjustMarginModal = useCallback(() => setCurrentAdjustMarginSymbol(null), []);

  const columns = useMemo<readonly ColumnSelectorItem[]>(() => [{
    id: 'symbol',
    display: 'Position',
  }, {
    id: 'mode',
    display: 'Mode',
  }, {
    id: 'size',
    display: 'Size',
  }, {
    id: 'margin',
    display: 'Margin',
  }, {
    id: 'last_price',
    display: 'Last Price',
  }, {
    id: 'entry_price',
    display: 'Entry Price',
  }, {
    id: 'liquidation_price',
    display: 'Liquidation',
  }, {
    id: 'break_even_price',
    display: 'Break-even',
  }, {
    id: 'realized_pnl',
    display: 'Realized PNL',
    title: 'Realized Profit and Loss',
  }, {
    id: 'pnl',
    display: 'PNL',
    title: 'Profit and Loss',
  }, {
    id: 'roi',
    display: 'ROI',
    title: 'Return on Investment',
  }, {
    id: 'row',
    display: 'ROW',
    title: 'Return on Wallet',
  }], []);

  return (
    <>
      <AdjustMarginModal symbol={currentAdjustMarginSymbol} onClose={closeAdjustMarginModal} />
      <Table className="align-middle">
        <thead>
          <tr>
            {columns.map(({ id, display, title }) => (
              !hiddenPositionColumns.includes(id) ? (
                <th key={id} ref={title ? tooltipRef({ title }) : undefined}>
                  {display}
                </th>
              ) : null
            ))}
            <th style={{ width: '100px' }}>
              Close
            </th>
            <td className="p-0">
              <ColumnSelector
                id="order_column_selector"
                columns={columns}
                hiddenColumnIds={hiddenPositionColumns}
                setHiddenColumnIds={setHiddenPositionColumns}
              />
            </td>
          </tr>
        </thead>
        <tbody>
          {openPositions.map(({
            symbol, baseAsset, baseValue, liquidationPrice, entryPrice, positionAmt,
            marginType, leverage, lastPrice, breakEvenPrice, realizedPnl,
            side, pnl, pnlBalancePercent, pnlPositionPercent, isClosed, calculatedMargin,
          }) => (
            <tr key={symbol} className={isClosed ? 'o-50' : undefined}>
              {!hiddenPositionColumns.includes('symbol') && (
              <td>
                <span
                  className="link-alike"
                  onClick={() => setSymbol(symbol)}
                  onKeyDown={() => setSymbol(symbol)}
                  role="button"
                  tabIndex={0}
                >
                  {baseAsset}
                </span>
                {' '}
                &nbsp;
                <Badge color={side === 'BUY' ? 'buy' : 'sell'}>
                  {leverage}
                  x
                </Badge>
              </td>
              )}
              {!hiddenPositionColumns.includes('mode') && (<td>{marginType === 'cross' ? <em className="text-warning">Cross</em> : 'Isolated'}</td>)}
              {!hiddenPositionColumns.includes('size') && (
              <td>
                {positionAmt}
                {' '}
                (
                {formatNumber(baseValue, true)}
                &nbsp;$)
              </td>
              )}
              {!hiddenPositionColumns.includes('margin') && (
              <td>
                {marginType === 'cross' ? <em className="text-warning">Cross</em>
                  : (
                    <>
                      {formatNumber(calculatedMargin, true)}
                      &nbsp;$
                      {' '}
                      (
                      {formatPercent((calculatedMargin / totalWalletBalance) * 100)}
                      %)
                      {' '}
                      {marginType === 'isolated' && (
                        <PencilSquare className="muted-control" onClick={() => setCurrentAdjustMarginSymbol(symbol)} />
                      )}
                    </>
                  )}
              </td>
              )}
              {!hiddenPositionColumns.includes('last_price') && (
              <td>
                {formatNumber(lastPrice)}
                &nbsp;$
                {' '}
                (
                {(lastPrice - entryPrice > 0 ? '+' : '') + formatPercent(
                  ((lastPrice - entryPrice) / lastPrice) * 100,
                )}
                %)
              </td>
              )}
              {!hiddenPositionColumns.includes('entry_price') && (
              <td>
                {formatNumber(entryPrice)}
                &nbsp;$
              </td>
              )}
              {!hiddenPositionColumns.includes('liquidation_price') && (
              <td>
                {marginType === 'isolated' ? (
                  <>
                    {formatNumber(liquidationPrice)}
                    &nbsp;$
                  </>
                ) : <>&mdash;</>}
              </td>
              )}
              {!hiddenPositionColumns.includes('break_even_price') && (
              <td>
                {breakEvenPrice ? (
                  <>
                    {formatNumber(breakEvenPrice)}
                    &nbsp;$
                  </>
                ) : '...'}
              </td>
              )}
              {!hiddenPositionColumns.includes('realized_pnl') && (
              <td>
                <span className={textClassName(realizedPnl ?? 0)}>
                  {typeof realizedPnl === 'number' ? formatNumber(realizedPnl, true) : '...'}
                  &nbsp;$
                </span>
              </td>
              )}
              {!hiddenPositionColumns.includes('pnl') && (
              <td>
                <span className={textClassName(pnl)}>
                  {formatNumber(pnl, true)}
                  &nbsp;$
                </span>
              </td>
              )}
              {!hiddenPositionColumns.includes('roi') && (
              <td>
                <span className={textClassName(pnlPositionPercent)}>
                  {formatPercent(pnlPositionPercent)}
                  %
                </span>
              </td>
              )}
              {!hiddenPositionColumns.includes('row') && (
              <td>
                <span className={textClassName(pnlBalancePercent)}>
                  {formatPercent(pnlBalancePercent)}
                  %
                </span>
              </td>
              )}
              <td>
                <Button
                  color="link"
                  className="text-muted px-0"
                  disabled={isClosed}
                  onClick={() => onCloseMarket(symbol)}
                >
                  {isClosed ? 'Closing...' : 'Market'}
                </Button>
              </td>
              <td />
            </tr>
          ))}
        </tbody>
        {!openPositions.length && (
        <tfoot>
          <tr>
            <td colSpan={100} align="center" className="text-muted">
              <em>You don&apos;t have open positions or they aren&apos;t loaded yet</em>
            </td>
          </tr>
        </tfoot>
        )}
      </Table>
    </>
  );
};

export default Positions;
