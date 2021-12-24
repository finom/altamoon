import { format } from 'd3-format';
import React, { ReactElement, useCallback, useState } from 'react';
import { PencilSquare } from 'react-bootstrap-icons';
import { Badge, Button, Table } from 'reactstrap';
import { useSet, useSilent, useValue } from 'use-change';
import useValueDebounced from '../../../hooks/useValueDebounced';
import tooltipRef from '../../../lib/tooltipRef';
import { ACCOUNT, PERSISTENT, TRADING } from '../../../store';
import AdjustMarginModal from './AdjustMarginModal';

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
  const [currentAdjustMarginSymbol, setCurrentAdjustMarginSymbol] = useState<string | null>(null);

  const onCloseMarket = useCallback(async (symbol: string) => {
    try { await closePosition(symbol); } catch {}
  }, [closePosition]);
  const closeAdjustMarginModal = useCallback(() => setCurrentAdjustMarginSymbol(null), []);

  return (
    <>
      <AdjustMarginModal symbol={currentAdjustMarginSymbol} onClose={closeAdjustMarginModal} />
      <Table className="align-middle">
        <thead>
          <tr>
            <th>Position</th>
            <th>Mode</th>
            <th>Size</th>
            <th>Margin</th>
            <th>Last Price</th>
            <th>Entry Price</th>
            <th>Liquidation</th>
            <th>Break-even</th>
            <th><span className="help-text" ref={tooltipRef({ title: 'Realized Profit and Loss' })}>Realized PNL</span></th>
            <th><span className="help-text" ref={tooltipRef({ title: 'Profit and Loss' })}>PNL</span></th>
            <th>
              <span className="help-text" ref={tooltipRef({ title: 'Return on Investment' })}>ROI</span>
            </th>
            <th>
              <span className="help-text" ref={tooltipRef({ title: 'Return on Wallet' })}>ROW</span>
            </th>
            <th style={{ width: '100px' }}>
              Close
            </th>
          </tr>
        </thead>
        <tbody>
          {openPositions.map(({
            symbol, baseAsset, baseValue, liquidationPrice, entryPrice, positionAmt,
            marginType, leverage, lastPrice, breakEvenPrice, realizedPnl,
            side, pnl, pnlBalancePercent, pnlPositionPercent, isClosed, calculatedMargin,
          }) => (
            <tr key={symbol} className={isClosed ? 'o-50' : undefined}>
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
              <td>{marginType === 'cross' ? <em className="text-warning">Cross</em> : 'Isolated'}</td>
              <td>
                {positionAmt}
                {' '}
                (
                {formatNumber(baseValue, true)}
                &nbsp;₮)
              </td>
              <td>
                {marginType === 'cross' ? <em className="text-warning">Cross</em>
                  : (
                    <>
                      {formatNumber(calculatedMargin, true)}
                      &nbsp;₮
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
              <td>
                {formatNumber(lastPrice)}
                &nbsp;₮
              </td>
              <td>
                {formatNumber(entryPrice)}
                &nbsp;₮
              </td>
              <td>
                {marginType === 'isolated' ? (
                  <>
                    {formatNumber(liquidationPrice)}
                    &nbsp;₮
                  </>
                ) : <>&mdash;</>}
              </td>
              <td>
                {breakEvenPrice ? (
                  <>
                    {formatNumber(breakEvenPrice)}
                    &nbsp;₮
                  </>
                ) : '...'}
              </td>
              <td>
                <span className={textClassName(realizedPnl ?? 0)}>
                  {typeof realizedPnl === 'number' ? formatNumber(realizedPnl, true) : '...'}
                  &nbsp;₮
                </span>
              </td>
              <td>
                <span className={textClassName(pnl)}>
                  {formatNumber(pnl, true)}
                  &nbsp;₮
                </span>
              </td>
              <td>
                <span className={textClassName(pnlPositionPercent)}>
                  {formatPercent(pnlPositionPercent)}
                  %
                </span>
              </td>
              <td>
                <span className={textClassName(pnlBalancePercent)}>
                  {formatPercent(pnlBalancePercent)}
                  %
                </span>
              </td>
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
