import React, { ReactElement, useState } from 'react';
import {
  Nav, NavItem, NavLink, TabContent,
} from 'reactstrap';
import useChange from 'use-change';

import useWidgetSizeBreakpoint from '../../../hooks/useWidgetSizeBreakpoint';
import Widget from '../../layout/Widget';
import TradingOptions from './TradingOptions';
import { RootStore } from '../../../store';
import Limit from './Limit';
import Market from './Market';
import StopLimit from './StopLimit';
import StopMarket from './StopMarket';

const Trading = ({ title }: { title: string }): ReactElement => {
  const [type, setType] = useChange(({ persistent }: RootStore) => persistent, 'tradingType');
  const [isWideLayout, wideLayoutRef] = useWidgetSizeBreakpoint('lg');
  const [postOnly, setPostOnly] = useState(false);
  const [reduceOnly, setReduceOnly] = useState(false);

  return (
    <Widget title={title} bodyRef={wideLayoutRef} shouldCheckAccount>
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
        <NavItem>
          <NavLink active={type === 'STOP_MARKET'} onClick={() => setType('STOP_MARKET')} className="cursor-pointer">Stop Market</NavLink>
        </NavItem>
        <NavItem>
          <NavLink active={type === 'STOP'} onClick={() => setType('STOP')} className="cursor-pointer">Stop Limit</NavLink>
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
        <div className={`tab-pane fade${type === 'STOP_MARKET' ? ' show active' : ''}`}>
          <StopMarket
            isWideLayout={isWideLayout}
            postOnly={postOnly}
            reduceOnly={reduceOnly}
            tradingType="STOP_MARKET"
          />
        </div>
        <div className={`tab-pane fade${type === 'STOP' ? ' show active' : ''}`}>
          <StopLimit
            isWideLayout={isWideLayout}
            postOnly={postOnly}
            reduceOnly={reduceOnly}
            tradingType="STOP"
          />
        </div>
      </TabContent>
    </Widget>
  );
};

export default Trading;
