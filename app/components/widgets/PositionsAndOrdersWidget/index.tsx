import React, { memo, ReactElement } from 'react';
import Widget from '../../layout/Widget';
import Positions from './Positions';
import Orders from './Orders';

const PositionsAndOrdersWidget = ({ title, id }: { title: string; id: string; }): ReactElement => (
  <Widget id={id} title={title} shouldCheckAccount>
    <Positions />
    <Orders />
  </Widget>
);

export default memo(PositionsAndOrdersWidget);
