import { format } from 'd3-format';
import { remove } from 'lodash';
import React, { ReactElement, useCallback, useState } from 'react';
import { Badge, Button, Table } from 'reactstrap';
import { useSilent, useValue } from 'use-change';
import { TRADING } from '../../../store';

const formatNumber = (n: number, ignorePrecision?: boolean) => format(n < 10 && !ignorePrecision ? ',.4f' : ',.2f')(n);
const formatPercent = format(',.1f');

const textClassName = (value: number) => {
  if (!value) return '';

  return value > 0 ? 'text-success' : 'text-danger';
};

const Positions = (): ReactElement => {
  const openPositions = useValue(TRADING, 'openPositions');
  const closePosition = useSilent(TRADING, 'closePosition');
  const [symbolsToClose, setSymbolsToClose] = useState<string[]>([]);
  const onCloseMarket = useCallback(async (symbol: string) => {
    setSymbolsToClose([...symbolsToClose, symbol]);

    try { await closePosition(symbol); } catch {}

    setSymbolsToClose(remove(symbolsToClose, symbol));
  }, [closePosition, symbolsToClose]);

  return (
    <Table className="align-middle">
      <thead>
        <tr>
          <th>
            Position Asset
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
          <th style={{ width: '100px' }}>
            Close
          </th>
        </tr>
      </thead>
      <tbody>
        {openPositions.map(({
          baseAsset, symbol, baseValue, liquidationPrice, entryPrice, positionAmt,
          isolatedWallet, marginType, leverage, lastPrice,
          side, pnl, pnlPercent, truePnl, truePnlPercent,
        }) => (
          <tr key={symbol}>
            <td>
              {baseAsset}
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
            <td>
              {formatNumber(lastPrice)}
              {' '}
              ₮
            </td>
            <td>
              {formatNumber(entryPrice)}
              {' '}
              ₮
            </td>
            <td>{marginType === 'isolated' ? `${formatNumber(liquidationPrice)} ₮` : <>&mdash;</>}</td>
            <td>{marginType === 'isolated' ? `${formatNumber(isolatedWallet, true)} ₮` : <em className="text-warning">Cross</em>}</td>
            <td>
              <span className={textClassName(pnl)}>
                {formatNumber(pnl, true)}
                {' '}
                ₮
              </span>
              {' '}
              <span className={textClassName(pnlPercent)}>
                (
                {formatPercent(pnlPercent)}
                %)
              </span>
            </td>
            <td>
              <span className={textClassName(truePnl)}>
                {formatNumber(truePnl, true)}
                {' '}
                ₮
              </span>
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
                disabled={symbolsToClose.includes(symbol)}
                onClick={() => onCloseMarket(symbol)}
              >
                {symbolsToClose.includes(symbol) ? 'Closing...' : 'Market'}
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
  );
};

export default Positions;
