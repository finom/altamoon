import React, { ReactElement } from 'react';
import { Col, Row } from 'reactstrap';
import useChange, { useValue } from 'use-change';
import { RootStore } from '../../../store';

import css from './style.css';

interface Props {
  postOnly: boolean;
  reduceOnly: boolean;
  setPostOnly: (b: boolean) => void;
  setReduceOnly: (b: boolean) => void;
}

const Leverage = ({
  postOnly,
  reduceOnly,
  setPostOnly,
  setReduceOnly,
}: Props): ReactElement => {
  const maxLeverage = useValue(({ trading }: RootStore) => trading, 'currentSymbolMaxLeverage');
  const [isIsolated, setIsISolated] = useChange(({ trading }: RootStore) => trading, 'isCurrentSymbolMarginTypeIsolated');
  const [leverage, setLeverage] = useChange(({ trading }: RootStore) => trading, 'currentSymbolLeverage');

  return (
    <Row>
      <Col xs={6}>
        <div className="nowrap">Leverage</div>
      </Col>
      <Col xs={6} className="nowrap text-end">
        {leverage}
        x
      </Col>
      <Col xs={12} className="mb-3">
        <input
          type="range"
          className="form-range"
          value={leverage}
          min={1}
          max={maxLeverage}
          step={1}
          onChange={({ target }) => setLeverage(+target.value)}
        />
        <span className={`${css.minLeverage} text-muted`}>1x</span>
        <span className={`${css.maxLeverage} text-muted`}>
          {maxLeverage}
          x
        </span>
      </Col>
      <Col xs={12}>
        <div className="form-check form-check-inline">
          <label className="form-check-label" htmlFor="reduceOnly">
            <input
              className="form-check-input"
              type="checkbox"
              id="reduceOnly"
              onChange={({ target }) => setReduceOnly(target.checked)}
              checked={reduceOnly}
            />
            {' '}
            Reduce-only
          </label>
        </div>
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
