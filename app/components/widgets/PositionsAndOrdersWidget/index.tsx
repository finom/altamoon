import React, { ReactElement } from 'react';
import Widget from '../../layout/Widget';
import Positions from './Positions';
import Orders from './Orders';

const PositionsAndOrdersWidget = ({ title }: { title: string }): ReactElement => (
  <Widget title={title} shouldCheckAccount>
    <Positions />
    <Orders />
  </Widget>
);

export default PositionsAndOrdersWidget;
