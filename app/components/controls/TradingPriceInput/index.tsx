import React, { ReactElement } from 'react';
import { GraphUp } from 'react-bootstrap-icons';
import classNames from 'classnames';

import LabeledInput from '../LabeledInput';
import css from './style.css';
import tooltipRef from '../../../lib/tooltipRef';

interface Props {
  id: string;
  value: string;
  side: 'BUY' | 'SELL' | 'STOP_BUY' | 'STOP_SELL';
  shouldShowPriceLine: boolean;
  onChangeShouldShowPriceLine: (v: boolean) => void;
  onChange: (v: string) => void;
}

const TradingPriceInput = ({
  id, value, side, shouldShowPriceLine, onChangeShouldShowPriceLine, onChange,
}: Props): ReactElement => (
  <div className="input-group mb-3">
    <LabeledInput
      label="$"
      rightLabel={(
        // eslint-disable-next-line max-len
        /* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
        <span
          className={classNames({
            'text-buy': shouldShowPriceLine && side === 'BUY',
            'text-sell': shouldShowPriceLine && side === 'SELL',
            'text-stop-buy': shouldShowPriceLine && side === 'STOP_BUY',
            'text-stop-sell': shouldShowPriceLine && side === 'STOP_SELL',
          })}
          ref={tooltipRef()}
          title="Toggle draft line visibility"
          onClick={() => onChangeShouldShowPriceLine(!shouldShowPriceLine)}
        >
          <GraphUp />
        </span>
      )}
      rightLabelClassName={css.draftChartLineToggle}
      type="text"
      id={`${id}_tradingPrice`}
      value={value}
      onChange={onChange}
    />
  </div>
);

export default TradingPriceInput;
