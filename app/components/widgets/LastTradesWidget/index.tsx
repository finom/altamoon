import React, {
  memo, ReactElement, SyntheticEvent, useCallback, useState,
} from 'react';
import { Input, Label, Table } from 'reactstrap';
import { format } from 'd3-format';
import useChange, { useValue } from '../../../hooks/useChange';
import { RootStore } from '../../../store';
import Widget from '../../layout/Widget';
import css from './style.css';

const LastTradesWidget = (): ReactElement => {
  const lastTrades = useValue(({ market }: RootStore) => market, 'lastTrades');
  const [existingIgnoreValuesBelowNumber, preserveIgnoreValuesBelowNumber] = useChange(
    ({ persistent }: RootStore) => persistent, 'ignoreValuesBelowNumber',
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
      noPadding
      bodyClassName={css.widgetBody}
      title="Last Trades"
      onSettingsClose={resetIgnoreValueField}
      onSettingsSave={saveSettings}
      settings={(
        <>
          <Label htmlFor="ignoreValuesBelowNumber" className="form-label">Ignore Values Below (₮)</Label>
          <Input
            type="number"
            id="ignoreValuesBelowNumber"
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
                <tr key={aggTradeId} className={maker ? 'table-sell' : 'table-success'}>
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
