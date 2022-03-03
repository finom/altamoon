import classNames from 'classnames';
import React, {
  memo,
  ReactElement, useEffect, useMemo, useRef,
} from 'react';
import { Col, Row } from 'reactstrap';
import useChange, { useSilent, useValue } from 'use-change';
import formatMoneyNumber from '../../../lib/formatMoneyNumber';
import tooltipRef from '../../../lib/tooltipRef';
import { ACCOUNT, PERSISTENT, TRADING } from '../../../store';

import css from './style.css';

interface Props {
  postOnly: boolean;
  setPostOnly: (b: boolean) => void;
}

const TradingOptions = ({
  postOnly,
  setPostOnly,
}: Props): ReactElement => {
  const updateLeverage = useSilent(TRADING, 'updateLeverage');
  const maxLeverage = useValue(TRADING, 'currentSymbolMaxLeverage');
  const [isIsolated, setIsISolated] = useChange(TRADING, 'isCurrentSymbolMarginTypeIsolated');
  const [currentSymbolLeverage, setCurrentSymbolLeverage] = useChange(TRADING, 'currentSymbolLeverage');
  const leverageBrackets = useValue(ACCOUNT, 'leverageBrackets');
  const symbol = useValue(PERSISTENT, 'symbol');
  const leverageTooltipRef = useRef<bootstrap.Tooltip & {
    tip?: HTMLDivElement; isShown?: boolean;
  } | null>();
  const leverageBracket = useMemo(() => leverageBrackets[symbol]?.slice().reverse().find(
    ({ initialLeverage: l }) => l >= currentSymbolLeverage,
  ) ?? null, [currentSymbolLeverage, leverageBrackets, symbol]);
  const notionalCap = leverageBracket?.notionalCap;

  const leverageTooltipText = `
  Maximum position at leverage <b>${currentSymbolLeverage}x</b> is ${formatMoneyNumber(notionalCap ?? 0)} USDT
  <a class="text-nowrap d-block" href="https://www.binance.com/en/futures/trading-rules/perpetual/leverage-margin" target="_blank" rel="noreferrer">Check the Leverage & Margin table</a>
  <a class="text-nowrap d-block" href="https://www.binance.com/en/futures/position/adjustment" target="_blank" rel="noreferrer"> Position Limit Enlarge</a>
`;

  useEffect(() => {
    const tooltipInstance = leverageTooltipRef.current;
    if (!tooltipInstance) return;

    const tipInner = tooltipInstance.tip?.querySelector<HTMLDivElement>('.tooltip-inner');

    if (tipInner) tipInner.innerHTML = leverageTooltipText;
  }, [currentSymbolLeverage, leverageTooltipText]);

  return (
    <Row>
      <Col xs={6}>
        <div className="nowrap">Leverage</div>
      </Col>
      <Col xs={6} className="nowrap text-end">
        {currentSymbolLeverage}
        x
      </Col>
      <Col xs={12} className={classNames({ 'mb-3': true, 'o-50 cursor-progress': !leverageBracket })}>
        <input
          type="range"
          className={classNames({ 'form-range': true, 'pe-none': !leverageBracket })}
          value={currentSymbolLeverage}
          min={1}
          max={maxLeverage}
          step={1}
          ref={tooltipRef({
            trigger: 'hover focus',
            placement: 'top',
          }, (instance) => { leverageTooltipRef.current = instance; })}
          data-bs-original-title={leverageTooltipText}
          onChange={({ target }) => setCurrentSymbolLeverage(+target.value)}
          onMouseUp={() => void updateLeverage()}
          onKeyUp={() => void updateLeverage()}
          onTouchEnd={() => void updateLeverage()}
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
          <select
            className={classNames({
              'form-control form-select': true,
              'text-warning': !isIsolated,
            })}
            value={isIsolated ? 'isolated' : 'cross'}
            onChange={({ target }) => setIsISolated(target.value === 'isolated')}
          >
            <option value="cross">Cross Margin</option>
            <option value="isolated">Isolated Margin</option>
          </select>
        </div>
      </Col>
    </Row>
  );
};

export default memo(TradingOptions);
