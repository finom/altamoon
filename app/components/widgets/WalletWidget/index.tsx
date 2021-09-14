import React, { memo, ReactElement } from 'react';
import { format } from 'd3';
import { useValue } from 'use-change';
import truncateDecimals from '../../../lib/truncateDecimals';
import { ACCOUNT, STATS } from '../../../store';
import Widget from '../../layout/Widget';
import TransferFunds from './TransferFunds';

import css from './style.css';

const formatNumber = (value: number) => format(',.2f')(truncateDecimals(value, 2));

const WalletWidget = ({ title, id }: { title: string; id: string; }): ReactElement => {
  const totalWalletBalance = useValue(ACCOUNT, 'totalWalletBalance');
  const availableBalance = useValue(ACCOUNT, 'availableBalance');
  const totalPositionInitialMargin = useValue(ACCOUNT, 'totalPositionInitialMargin');
  const totalOpenOrderInitialMargin = useValue(ACCOUNT, 'totalOpenOrderInitialMargin');
  const pnlValue = useValue(STATS, 'pnlValue');
  const pnlPercent = useValue(STATS, 'pnlPercent');
  const dailyPnlValue = useValue(STATS, 'dailyPnlValue');
  const dailyPnlPercent = useValue(STATS, 'dailyPnlPercent');

  return (
    <Widget id={id} title={title}>
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
              Available Balance:
            </td>
            <td className={`${css.valueCell} form-control`}>
              {formatNumber(availableBalance)}
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
              {format(',.1%')(dailyPnlPercent || 0)}
              )
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
              {format(',.1%')(totalPositionInitialMargin / totalWalletBalance || 0)}
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
              {format(',.1%')(totalOpenOrderInitialMargin / totalWalletBalance || 0)}
              )
            </td>
          </tr>
        </tbody>
      </table>
      <div className="text-center">
        <TransferFunds />
      </div>
    </Widget>
  );
};

export default memo(WalletWidget);
