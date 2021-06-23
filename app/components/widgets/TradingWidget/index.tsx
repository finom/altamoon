import React, { ReactElement, useState } from 'react';
import {
  Nav, NavItem, NavLink, TabContent,
} from 'reactstrap';
import useChange from 'use-change';

import useWidgetSizeBreakpoint from '../../../hooks/useWidgetSizeBreakpoint';
import Widget from '../../layout/Widget';
import TradingOptions from './TradingOptions';
import Limit from './Limit';
import Market from './Market';
import { RootStore } from '../../../store';

const Trading = (): ReactElement => {
  const [type, setType] = useChange(({ persistent }: RootStore) => persistent, 'tradingType');
  const [isWideLayout, wideLayoutRef] = useWidgetSizeBreakpoint('lg');
  const [postOnly, setPostOnly] = useState(false);
  const [reduceOnly, setReduceOnly] = useState(false);

  return (
    <Widget title="Trading" bodyRef={wideLayoutRef} checkAccount>
      <TradingOptions
        postOnly={postOnly}
        reduceOnly={reduceOnly}
        setPostOnly={setPostOnly}
        setReduceOnly={setReduceOnly}
      />
      <Nav tabs className="mt-3">
        <NavItem>
          <NavLink active={type === 'MARKET'} onClick={() => setType('MARKET')} className="cursor-pointer">Market</NavLink>
        </NavItem>
        <NavItem>
          <NavLink active={type === 'LIMIT'} onClick={() => setType('LIMIT')} className="cursor-pointer">Limit</NavLink>
        </NavItem>
      </Nav>
      <TabContent className="p-1">
        <div className={`tab-pane fade${type === 'MARKET' ? ' show active' : ''}`}>
          <Market
            isWideLayout={isWideLayout}
            postOnly={postOnly}
            reduceOnly={reduceOnly}
            tradingType="MARKET"
          />
        </div>
        <div className={`tab-pane fade${type === 'LIMIT' ? ' show active' : ''}`}>
          <Limit
            isWideLayout={isWideLayout}
            postOnly={postOnly}
            reduceOnly={reduceOnly}
            tradingType="LIMIT"
          />
        </div>
      </TabContent>
    </Widget>
  );
};

export default Trading;
