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
  exactSizeBuyStr: string;
  setExactSizeBuyStr: (value: string) => void;
  exactSizeSellStr: string;
  setExactSizeSellStr: (value: string) => void;
}

const TradingTab = ({
  isWideLayout, postOnly,
  buyPrice, sellPrice, stopBuyPrice, stopSellPrice, id, buyNode, sellNode, tradingType,
  exactSizeBuyStr, setExactSizeBuyStr, exactSizeSellStr, setExactSizeSellStr,
}: Props): ReactElement => {
  const [compactModeSide, setCompactModeSide] = useChange(PERSISTENT, 'compactModeSide');
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
          >
            {sellNode}
          </TradingSide>
        </Col>
      </Row>
    </>
  );
};

export default TradingTab;
