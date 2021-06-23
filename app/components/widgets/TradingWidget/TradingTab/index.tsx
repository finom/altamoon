import React, {
  ReactNode, ReactElement, useCallback, useState,
} from 'react';
import { Row, Col } from 'reactstrap';
import * as api from '../../../../api';
import Toggle from '../../../controls/Toggle';
import TradingSide from './TradingSide';

interface Props {
  isWideLayout: boolean;
  postOnly: boolean;
  reduceOnly: boolean;
  buyPrice: number | null;
  sellPrice: number | null;
  id: string;
  buyNode?: ReactNode;
  sellNode?: ReactNode;
  tradingType: api.OrderType;
}

const TradingTab = ({
  isWideLayout, postOnly, reduceOnly,
  buyPrice, sellPrice, id, buyNode, sellNode, tradingType,
}: Props): ReactElement => {
  ((n: boolean) => n)(postOnly); // just to temporarily disable TS "never read" error
  const [compactModeSide, setCompactModeSide] = useState<api.OrderSide>('BUY');
  const switchSide = useCallback((v: boolean) => setCompactModeSide(v ? 'BUY' : 'SELL'), []);

  return (
    <>
      {!isWideLayout && (
        <Toggle
          id={`${id}_marketBuySellSwitch`}
          checkedLabel="Buy/Long"
          uncheckedLabel="Sell/Short"
          className="my-3"
          isChecked={compactModeSide === 'BUY'}
          onChange={switchSide}
        />
      )}
      <Row>
        <Col hidden={!isWideLayout && compactModeSide !== 'BUY'}>
          <TradingSide id={id} side="BUY" reduceOnly={reduceOnly} postOnly={postOnly} price={buyPrice} tradingType={tradingType}>
            {buyNode}
          </TradingSide>
        </Col>
        <Col hidden={!isWideLayout && compactModeSide !== 'SELL'}>
          <TradingSide id={id} side="SELL" reduceOnly={reduceOnly} postOnly={postOnly} price={sellPrice} tradingType={tradingType}>
            {sellNode}
          </TradingSide>
        </Col>
      </Row>
    </>
  );
};

export default TradingTab;
