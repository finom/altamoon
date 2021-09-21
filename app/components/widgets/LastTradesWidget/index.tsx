import React, {
  memo, ReactElement, SyntheticEvent, useCallback, useState,
} from 'react';
import { Input, Label, Table } from 'reactstrap';
import { format } from 'd3';
import useChange, { useValue } from 'use-change';

import { MARKET, PERSISTENT } from '../../../store';
import Widget from '../../layout/Widget';
import css from './style.css';

const LastTradesWidget = ({ title, id }: { title: string; id: string; }): ReactElement => {
  const lastTrades = useValue(MARKET, 'lastTrades');
  const [existingIgnoreValuesBelowNumber, preserveIgnoreValuesBelowNumber] = useChange(
    PERSISTENT, 'ignoreValuesBelowNumber',
  );
  const [ignoreValuesBelowNumber, setIgnoreValuesBelowNumber] = useState(
    existingIgnoreValuesBelowNumber,
  );
  const resetIgnoreValueField = useCallback(
    () => setIgnoreValuesBelowNumber(existingIgnoreValuesBelowNumber),
    [existingIgnoreValuesBelowNumber],
  );
  const saveSettings = useCallback(
    () => preserveIgnoreValuesBelowNumber(ignoreValuesBelowNumber),
    [ignoreValuesBelowNumber, preserveIgnoreValuesBelowNumber],
  );
  const onIgnoreValuesInputChange = useCallback(
    ({
      currentTarget,
    }: SyntheticEvent<HTMLInputElement>) => setIgnoreValuesBelowNumber(+currentTarget.value || 0),
    [],
  );

  return (
    <Widget
      id={id}
      noPadding
      bodyClassName={css.widgetBody}
      title={title}
      onSettingsCancel={resetIgnoreValueField}
      onSettingsSave={saveSettings}
      settings={(
        <>
          <Label htmlFor="lastTradesIgnoreValuesBelowNumber" className="form-label">Ignore Values Below (₮)</Label>
          <Input
            type="number"
            id="lastTradesIgnoreValuesBelowNumber"
            value={ignoreValuesBelowNumber}
            onChange={onIgnoreValuesInputChange}
          />
        </>
      )}
    >
      <Table className={css.tableHeadTable}>
        <thead>
          <tr>
            <th className="col-4">Price</th>
            <th className="col-4">Amount</th>
            <th className="col-4">₮ Value</th>
          </tr>
        </thead>
      </Table>
      <div className={css.tableContainer}>
        <Table>
          <tbody>
            {lastTrades.map(({
              maker, price, amount, aggTradeId,
            }) => {
              const value = +price * +amount;
              const valueStr = format(value >= 10000 ? '.2s' : ',d')(value);

              return (
                <tr key={aggTradeId} className={maker ? 'table-sell' : 'table-buy'}>
                  <td className="col-4">
                    {price}
                  </td>
                  <td className="col-4">
                    {amount}
                  </td>
                  <td className="col-4">
                    {valueStr}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
    </Widget>
  );
};

export default memo(LastTradesWidget);
