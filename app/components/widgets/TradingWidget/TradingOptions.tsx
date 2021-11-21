import classNames from 'classnames';
import React, { ReactElement } from 'react';
import { InfoCircle } from 'react-bootstrap-icons';
import { Col, Row } from 'reactstrap';
import useChange, { useSilent, useValue } from 'use-change';
import formatMoneyNumber from '../../../lib/formatMoneyNumber';
import tooltipRef from '../../../lib/tooltipRef';
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
  const currentSymbolPseudoPosition = useValue(TRADING, 'currentSymbolPseudoPosition');
  const leverageBracket = currentSymbolPseudoPosition?.leverageBracket;
  const notionalCap = leverageBracket?.notionalCap;

  return (
    <Row>
      <Col xs={6}>
        <div className="nowrap">Leverage</div>
      </Col>
      <Col xs={6} className="nowrap text-end">
        {currentSymbolLeverage}
        x
        {' '}
        <span className={classNames({ 'd-inline-block': true, 'cursor-progress': !notionalCap })}>
          <span
            tabIndex={0}
            role="button"
            className={classNames({ 'o-hover-100': true, 'o-25 pe-none': !notionalCap, 'o-50': !!notionalCap })}
            data-bs-original-title={`
              Maximum position at current leverage: ${formatMoneyNumber(notionalCap ?? 0)} USDT
              <a class="text-nowrap d-block" href="https://www.binance.com/en/futures/trading-rules/perpetual/leverage-margin" target="_blank" rel="noreferrer">Check the Leverage & Margin table</a>
              <a class="text-nowrap d-block" href="https://www.binance.com/en/futures/position/adjustment" target="_blank" rel="noreferrer"> Position Limit Enlarge</a>
            `}
            ref={tooltipRef({ trigger: 'focus', placement: 'bottom' })}
          >
            <InfoCircle />
          </span>
        </span>
      </Col>
      <Col xs={12} className={classNames({ 'mb-3': true, 'o-50 cursor-progress': !leverageBracket })}>
        <input
          type="range"
          className={classNames({ 'form-range': true, 'pe-none': !leverageBracket })}
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
        <div className={classNames({ 'form-check float-lg-end': true, 'o-50 cursor-progress': !leverageBracket })}>
          <label className={classNames({ 'form-check-label': true, 'pe-none': !leverageBracket })} htmlFor="isIsolated">
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
