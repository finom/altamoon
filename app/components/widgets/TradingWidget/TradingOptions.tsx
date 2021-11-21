import React, { ReactElement } from 'react';
import { Col, Row } from 'reactstrap';
import useChange, { useSilent, useValue } from 'use-change';
import { TRADING } from '../../../store';

import css from './style.css';

interface Props {
  postOnly: boolean;
  setPostOnly: (b: boolean) => void;
}

const Leverage = ({
  postOnly,
  setPostOnly,
}: Props): ReactElement => {
  const updateLeverage = useSilent(TRADING, 'updateLeverage');
  const maxLeverage = useValue(TRADING, 'currentSymbolMaxLeverage');
  const [isIsolated, setIsISolated] = useChange(TRADING, 'isCurrentSymbolMarginTypeIsolated');
  const [currentSymbolLeverage, setCurrentSymbolLeverage] = useChange(TRADING, 'currentSymbolLeverage');

  return (
    <Row>
      <Col xs={6}>
        <div className="nowrap">Leverage</div>
      </Col>
      <Col xs={6} className="nowrap text-end">
        {currentSymbolLeverage}
        x
      </Col>
      <Col xs={12} className="mb-3">
        <input
          type="range"
          className="form-range"
          value={currentSymbolLeverage}
          min={1}
          max={maxLeverage}
          step={1}
          onChange={({ target }) => setCurrentSymbolLeverage(+target.value)}
          onMouseUp={() => updateLeverage()}
          onKeyUp={() => updateLeverage()}
        />
        <span className={`${css.minLeverage} text-muted`}>1x</span>
        <span className={`${css.maxLeverage} text-muted`}>
          {maxLeverage}
          x
        </span>
      </Col>
      <Col xs={12}>
        <div className="form-check form-check-inline">
          <label className="form-check-label" htmlFor="postOnly">
            <input
              className="form-check-input"
              type="checkbox"
              id="postOnly"
              onChange={({ target }) => setPostOnly(target.checked)}
              checked={postOnly}
            />
            {' '}
            Post-only
          </label>
        </div>
        <div className="form-check float-lg-end">
          <label className="form-check-label" htmlFor="isIsolated">
            <input
              className="form-check-input"
              type="checkbox"
              id="isIsolated"
              checked={!!isIsolated}
              onChange={({ target }) => setIsISolated(target.checked)}
            />
            {' '}
            Isolated Margin
          </label>
        </div>
      </Col>
    </Row>
  );
};

export default Leverage;
