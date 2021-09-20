import React, { memo, ReactElement } from 'react';
import { Table } from 'reactstrap';
import { useValue } from 'use-change';
import { MARKET } from '../../store';
import Widget from '../layout/Widget';

const MAX_COUNT = 30;

const LastTradesWidget = ({ title, id }: { title: string; id: string; }): ReactElement => {
  const asks = useValue(MARKET, 'asks').slice(0, MAX_COUNT);
  const bids = useValue(MARKET, 'bids').slice(0, MAX_COUNT);

  return (
    <Widget id={id} noPadding title={title}>
      <Table>
        <tbody>
          {asks.map(([askPrice, askAmount], i) => {
            const [bidPrice, bidAmount] = bids[i] ?? [];

            return (
              <tr key={askPrice}>
                <td className="col-3 table-buy">
                  {bidAmount}
                </td>
                <td className="col-3 table-buy">
                  {bidPrice}
                </td>
                <td className="col-3 table-sell">
                  {askPrice}
                </td>
                <td className="col-3 table-sell">
                  {askAmount}
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </Widget>
  );
};

export default memo(LastTradesWidget);
