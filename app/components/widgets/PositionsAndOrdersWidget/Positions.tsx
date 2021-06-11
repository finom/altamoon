import { format } from 'd3-format';
import React, { ReactElement } from 'react';
import { Badge, Button, Table } from 'reactstrap';
import { useSilent, useValue } from 'use-change';
import { RootStore } from '../../../store';

const formatNumber = (n: number, ignorePrecision?: boolean) => format(n < 10 && !ignorePrecision ? ',.4f' : ',.2f')(n);
const formatPercent = format(',.1f');

const textClassName = (value: number) => {
  if (!value) return '';

  return value > 0 ? 'text-success' : 'text-danger';
};

const Positions = (): ReactElement => {
  const tradingPositions = useValue(({ trading }: RootStore) => trading, 'tradingPositions');
  const closePosition = useSilent(({ trading }: RootStore) => trading, 'closePosition');

  return (
    <Table className="align-middle">
      <thead>
        <tr>
          <th>
            Symbol
          </th>
          <th>
            Size
          </th>
          <th>
            Last Price
          </th>
          <th>
            Entry Price
          </th>
          <th>
            Liq. Price
          </th>
          <th>
            Margin
          </th>
          <th>
            Position PNL
          </th>
          <th>
            True PNL
          </th>
          <th>
            Close
          </th>
        </tr>
      </thead>
      <tbody>
        {tradingPositions.map((tradingPosition) => {
          const {
            symbol, baseValue, liquidationPrice, entryPrice, positionAmt,
            isolatedMargin, marginType, leverage, lastPrice,
            side, pnl, pnlPercent, truePnl, truePnlPercent,
          } = tradingPosition;

          return (
            <tr key={symbol}>
              <td>
                {symbol.slice(0, -4)}
                {' '}
                &nbsp;
                <Badge className={side === 'BUY' ? 'bg-success' : 'bg-danger'}>
                  {leverage}
                  x
                </Badge>
              </td>
              <td>
                {positionAmt}
                {' '}
                (
                {formatNumber(baseValue, true)}
                {' '}
                ₮)
              </td>
              <td>{formatNumber(lastPrice)}</td>
              <td>{formatNumber(entryPrice)}</td>
              <td>{marginType === 'isolated' ? formatNumber(liquidationPrice) : <>&mdash;</>}</td>
              <td>{marginType === 'isolated' ? formatNumber(isolatedMargin, true) : <em className="text-warning">Cross</em>}</td>
              <td>
                <span className={textClassName(pnl)}>{formatNumber(pnl, true)}</span>
                {' '}
                <span className={textClassName(pnlPercent)}>
                  (
                  {formatPercent(pnlPercent)}
                  %)
                </span>
              </td>
              <td>
                <span className={textClassName(truePnl)}>{formatNumber(truePnl, true)}</span>
                {' '}
                <span className={textClassName(truePnlPercent)}>
                  (
                  {formatPercent(truePnlPercent)}
                  %)
                </span>
              </td>
              <td>
                <Button
                  color="link"
                  className="text-muted px-0"
                  onClick={() => closePosition(symbol)}
                >
                  Market
                </Button>
              </td>
            </tr>
          );
        })}
      </tbody>
      {!tradingPositions.length && (
      <tfoot>
        <tr>
          <td colSpan={100} align="center" className="text-muted"><em>You don&apos;t have open positions</em></td>
        </tr>
      </tfoot>
      )}
    </Table>
  );
};

export default Positions;
