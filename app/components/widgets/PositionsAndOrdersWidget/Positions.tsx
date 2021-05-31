import { format } from 'd3-format';
import React, { ReactElement } from 'react';
import { Badge, Button, Table } from 'reactstrap';
import { useSilent, useValue } from 'use-change';
import { RootStore } from '../../../store';
import Widget from '../../layout/Widget';

import css from './style.css';

console.log(css.sosiska);

const formatNumber = format(',.2f');
const formatPercent = format(',.1f');

const textClassName = (value: number) => {
  if (!value) return '';

  return value > 0 ? 'text-success' : 'text-danger';
};

const Positions = (): ReactElement => {
  const positions = useValue(({ trading }: RootStore) => trading, 'positions');
  const getPositionInfo = useSilent(({ trading }: RootStore) => trading, 'getPositionInfo');

  console.log('positions', positions);

  /*
  row.class(d => d.side)

                let pnl = getPnl()
                let pnlValue = format(pnl.value)
                let pnlPercent = formatPercent(pnl.percent)

                let td = () => row.append('td')
                td().text(d => d.symbol.slice(0,-4))
                td().text(d => d.qty)
                td().text(d => format(d.price))
                td().text(d => format(d.liquidation))
                td().text(d => format(d.margin))
                td().text(d => trueLeverage(d) + 'x')
                td().text(d => pnlValue + ` (${ pnlPercent })`)
                td().append('button')
                    .on('click', d => api.closePosition(d.symbol))
                    .html('Market')
                    */

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
        {positions.map((position) => {
          const {
            symbol, positionAmt, entryPrice, liquidationPrice,
            isolatedMargin, marginType, leverage,
          } = position;
          const size = +positionAmt * +entryPrice;
          const {
            side, pnl, pnlPercent, truePnl, truePnlPercent,
          } = getPositionInfo(position);

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
                {formatNumber(+positionAmt)}
                {' '}
                (
                {formatNumber(size)}
                {' '}
                ₮)
              </td>
              <td>{formatNumber(+entryPrice)}</td>
              <td>{marginType === 'isolated' ? formatNumber(+liquidationPrice) : <>&mdash;</>}</td>
              <td>{marginType === 'isolated' ? formatNumber(+isolatedMargin) : <>&mdash;</>}</td>
              <td>
                <span className={textClassName(pnl)}>{formatNumber(pnl)}</span>
                {' '}
                <span className={textClassName(pnlPercent)}>
                  (
                  {formatPercent(pnlPercent)}
                  %)
                </span>
              </td>
              <td>
                <span className={textClassName(truePnl)}>{formatNumber(truePnl)}</span>
                {' '}
                <span className={textClassName(truePnlPercent)}>
                  (
                  {formatPercent(truePnlPercent)}
                  %)
                </span>
              </td>
              <td>
                <Button color="link" className="text-muted px-0">Market</Button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
};

export default Positions;
