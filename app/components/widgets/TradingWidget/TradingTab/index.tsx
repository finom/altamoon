import React, { ReactNode, ReactElement, useCallback } from 'react';
import { Row, Col } from 'reactstrap';
import { Toggle } from 'altamoon-components';
import useChange from 'use-change';

import * as api from '../../../../api';
import TradingSide from './TradingSide';
import { PERSISTENT } from '../../../../store';

interface Props {
  isWideLayout: boolean;
  postOnly: boolean;
  buyPrice: number | null;
  sellPrice: number | null;
  stopBuyPrice: number | null;
  stopSellPrice: number | null;
  id: string;
  buyNode?: ReactNode;
  sellNode?: ReactNode;
  tradingType: api.OrderType;
}

const TradingTab = ({
  isWideLayout, postOnly,
  buyPrice, sellPrice, stopBuyPrice, stopSellPrice, id, buyNode, sellNode, tradingType,
}: Props): ReactElement => {
  const [compactModeSide, setCompactModeSide] = useChange(PERSISTENT, 'compactModeSide');

  const [exactSizeBuyStr, setExactSizeBuyStr] = useChange(PERSISTENT, 'tradingExactSizeBuyStr');
  const [exactSizeSellStr, setExactSizeSellStr] = useChange(PERSISTENT, 'tradingExactSizeSellStr');

  const [isPercentModeBuy, setIsPercentModeBuy] = useChange(PERSISTENT, 'tradingIsPercentModeBuy');
  const [isPercentModeSell, setIsPercentModeSell] = useChange(PERSISTENT, 'tradingIsPercentModeSell');

  const switchSide = useCallback((v: boolean) => setCompactModeSide(v ? 'SELL' : 'BUY'), [setCompactModeSide]);

  return (
    <>
      {!isWideLayout && (
        <Toggle
          id={`${id}_marketBuySellSwitch`}
          uncheckedLabel="Buy/Long"
          checkedLabel="Sell/Short"
          className="my-3"
          isChecked={compactModeSide !== 'BUY'}
          onChange={switchSide}
        />
      )}
      <Row>
        <Col hidden={!isWideLayout && compactModeSide !== 'BUY'}>
          <TradingSide
            id={id}
            side="BUY"
            postOnly={postOnly}
            price={buyPrice}
            stopPrice={stopBuyPrice}
            tradingType={tradingType}
            exactSizeStr={exactSizeBuyStr}
            setExactSizeStr={setExactSizeBuyStr}
            isPercentMode={isPercentModeBuy}
            setIsPercentMode={setIsPercentModeBuy}
          >
            {buyNode}
          </TradingSide>
        </Col>
        <Col hidden={!isWideLayout && compactModeSide !== 'SELL'}>
          <TradingSide
            id={id}
            side="SELL"
            postOnly={postOnly}
            price={sellPrice}
            stopPrice={stopSellPrice}
            tradingType={tradingType}
            exactSizeStr={exactSizeSellStr}
            setExactSizeStr={setExactSizeSellStr}
            isPercentMode={isPercentModeSell}
            setIsPercentMode={setIsPercentModeSell}
          >
            {sellNode}
          </TradingSide>
        </Col>
      </Row>
    </>
  );
};

export default TradingTab;
