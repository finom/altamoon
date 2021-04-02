import React, { memo, ReactElement } from 'react';
import { format } from 'd3-format';
import { useValue } from 'use-change';
import truncateDecimals from '../../../lib/truncateDecimals';
import { RootStore } from '../../../store';
import Widget from '../../layout/Widget';

import css from './style.css';

const formatNumber = (value: number) => format(',.2f')(truncateDecimals(value, 2));
const accountSelector = ({ account }: RootStore) => account;
const statsSelector = ({ stats }: RootStore) => stats;

const WalletWidget = (): ReactElement => {
  const totalWalletBalance = useValue(accountSelector, 'totalWalletBalance');
  const totalPositionInitialMargin = useValue(accountSelector, 'totalPositionInitialMargin');
  const totalOpenOrderInitialMargin = useValue(accountSelector, 'totalOpenOrderInitialMargin');
  const pnlValue = useValue(statsSelector, 'pnlValue');
  const pnlPercent = useValue(statsSelector, 'pnlPercent');
  const dailyPnlValue = useValue(statsSelector, 'dailyPnlValue');
  const dailyPnlPercent = useValue(statsSelector, 'dailyPnlPercent');
  const dailyBreakEven = useValue(statsSelector, 'dailyBreakEven');

  return (
    <Widget title="Wallet">
      <table className={css.table}>
        <tbody>
          <tr>
            <td className={css.labelCell}>
              Balance:
            </td>
            <td className={`${css.valueCell} form-control`}>
              {formatNumber(totalWalletBalance)}
            </td>
          </tr>
          <tr>
            <td className={css.labelCell}>
              Equity:
            </td>
            <td className={`${css.valueCell} form-control`}>
              {formatNumber(pnlValue + totalWalletBalance)}
            </td>
          </tr>
          <tr>
            <td className={css.labelCell}>
              Unrealized PNL:
            </td>
            <td className={`${css.valueCell} form-control`}>
              {formatNumber(pnlValue)}
              {' '}
              (
              {format(',.1%')(pnlPercent)}
              )
            </td>
          </tr>
          <tr>
            <td className={css.labelCell}>
              Daily PNL:
            </td>
            <td className={`${css.valueCell} form-control`}>
              {formatNumber(dailyPnlValue)}
              {' '}
              (
              {format(',.1%')(dailyPnlPercent)}
              )
            </td>
          </tr>
          <tr>
            <td className={css.labelCell}>
              Daily break-even:
            </td>
            <td className={`${css.valueCell} form-control`}>
              {formatNumber(dailyBreakEven)}
            </td>
          </tr>
          <tr>
            <td className={css.labelCell}>
              Position margin:
            </td>
            <td className={`${css.valueCell} form-control`}>
              {formatNumber(totalPositionInitialMargin)}
              {' '}
              (
              {format(',.1%')(totalPositionInitialMargin / totalWalletBalance)}
              )
            </td>
          </tr>
          <tr>
            <td className={css.labelCell}>
              Order margin:
            </td>
            <td className={`${css.valueCell} form-control`}>
              {formatNumber(totalOpenOrderInitialMargin)}
              {' '}
              (
              {format(',.1%')(totalOpenOrderInitialMargin / totalWalletBalance)}
              )
            </td>
          </tr>
        </tbody>
      </table>
    </Widget>
  );
};

export default memo(WalletWidget);
