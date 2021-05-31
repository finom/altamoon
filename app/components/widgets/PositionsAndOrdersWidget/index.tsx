import React, { ReactElement } from 'react';
import Widget from '../../layout/Widget';
import Positions from './Positions';

const PositionsAndOrdersWidget = (): ReactElement => (
  <Widget title="Positions & Orders" checkAccount>
    <Positions />
  </Widget>
);

export default PositionsAndOrdersWidget;
