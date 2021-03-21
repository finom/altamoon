import React, { memo, ReactElement } from 'react';
import { Table } from 'reactstrap';
import { useValue } from 'use-change';
import { RootStore } from '../../store';
import Widget from '../layout/Widget';

const MAX_COUNT = 30;

const LastTradesWidget = (): ReactElement => {
  const asks = useValue(({ market }: RootStore) => market, 'asks').slice(0, MAX_COUNT);
  const bids = useValue(({ market }: RootStore) => market, 'bids').slice(0, MAX_COUNT);

  return (
    <Widget noPadding title="Order Book">
      <Table>
        <tbody>
          {asks.map(([askPrice, askAmount], i) => {
            const [bidPrice, bidAmount] = bids[i] ?? [];

            return (
              <tr key={askPrice}>
                <td className="col-3 table-success">
                  {bidAmount}
                </td>
                <td className="col-3 table-success">
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
