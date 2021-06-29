import React, { ReactElement } from 'react';
import Widget from '../../layout/Widget';
import Positions from './Positions';
import Orders from './Orders';

const PositionsAndOrdersWidget = (): ReactElement => (
  <Widget title="Positions & Orders" shouldCheckAccount>
    <Positions />
    <Orders />
  </Widget>
);

export default PositionsAndOrdersWidget;
