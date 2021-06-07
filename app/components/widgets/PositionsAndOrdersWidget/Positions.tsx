import { format } from 'd3-format';
import React, { ReactElement } from 'react';
import { Badge, Button, Table } from 'reactstrap';
import { useValue } from 'use-change';
import { RootStore } from '../../../store';

const formatNumber = (n: number, ignorePrecision?: boolean) => format(n < 10 && !ignorePrecision ? ',.4f' : ',.2f')(n);
const formatPercent = format(',.1f');

const textClassName = (value: number) => {
  if (!value) return '';

  return value > 0 ? 'text-success' : 'text-danger';
};

const Positions = (): ReactElement => {
  const tradingPositions = useValue(({ trading }: RootStore) => trading, 'tradingPositions');

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
            Entity Price
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
              <td>{marginType === 'isolated' ? formatNumber(isolatedMargin, true) : <>&mdash;</>}</td>
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
                  onClick={() => alert('To do')}
                >
                  Market
                </Button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
};

export default Positions;
