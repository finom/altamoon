import React, { ReactElement, useState } from 'react';
import {
  Nav, NavItem, NavLink, TabContent,
} from 'reactstrap';
import useWidgetSizeBreakpoint from '../../../hooks/useWidgetSizeBreakpoint';

import Widget from '../../layout/Widget';
import TradingOptions from './TradingOptions';
import Limit from './Limit';
import Market from './Market';

type TabType = 'market' | 'limit';

const Trading = (): ReactElement => {
  const [type, setType] = useState<TabType>('market');
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
          <NavLink active={type === 'market'} onClick={() => setType('market')} className="cursor-pointer">Market</NavLink>
        </NavItem>
        <NavItem>
          <NavLink active={type === 'limit'} onClick={() => setType('limit')} className="cursor-pointer">Limit</NavLink>
        </NavItem>
      </Nav>
      <TabContent className="p-1">
        <div className={`tab-pane fade${type === 'market' ? ' show active' : ''}`}>
          <Market
            isWideLayout={isWideLayout}
            postOnly={postOnly}
            reduceOnly={reduceOnly}
          />
        </div>
        <div className={`tab-pane fade${type === 'limit' ? ' show active' : ''}`}>
          <Limit />
        </div>
      </TabContent>
    </Widget>
  );
};

export default Trading;
