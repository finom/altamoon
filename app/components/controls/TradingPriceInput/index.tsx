import React, { ReactElement } from 'react';
import { GraphUp, GraphDown } from 'react-bootstrap-icons';
import classNames from 'classnames';

import { OrderSide } from '../../../api';
import LabeledInput from '../LabeledInput';
import css from './style.css';
import tooltipRef from '../../../lib/tooltipRef';

interface Props {
  id: string;
  value: string;
  side: OrderSide;
  shouldShowPriceLine: boolean;
  onChangeShouldShowPriceLine: (v: boolean) => void;
  onChange: (v: string) => void;
}

const TradingPriceInput = ({
  id, value, side, shouldShowPriceLine, onChangeShouldShowPriceLine, onChange,
}: Props): ReactElement => (
  <div className="input-group mb-3">
    <LabeledInput
      label="₮"
      rightLabel={(
        // eslint-disable-next-line max-len
        /* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
        <span
          className={classNames({
            'text-buy': shouldShowPriceLine && side === 'BUY',
            'text-sell': shouldShowPriceLine && side === 'SELL',
          })}
          ref={tooltipRef()}
          title="Toggle draft line visibility"
          onClick={() => onChangeShouldShowPriceLine(!shouldShowPriceLine)}
        >
          {side === 'BUY' ? <GraphUp /> : <GraphDown />}
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
