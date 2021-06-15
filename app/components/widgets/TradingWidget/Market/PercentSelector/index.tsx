import { times } from 'lodash';
import * as bootstrap from 'bootstrap';
import React, { ReactElement, useState } from 'react';

import css from './style.css';

interface Props {
  availableBalance: number;
  totalWalletBalance: number;
  onSetValue: (value: string) => void;
}

const ITEMS_COUNT = 20; // 5%

const getPercentFromIndex = (i: number) => (i + 1) * (100 / ITEMS_COUNT);

const PercentSelector = ({
  availableBalance,
  totalWalletBalance,
  onSetValue,
}: Props): ReactElement => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <div className={css.wrapper}>
      {times(ITEMS_COUNT).map((i) => (
        <span
          key={i}
          className={`
            ${css.item}
            ${activeIndex > i || activeIndex === i ? css.active : ''}
            ${(getPercentFromIndex(i) / 100) * totalWalletBalance > availableBalance ? css.unavailable : ''}
          `}
          tabIndex={i}
          onMouseMove={() => setActiveIndex(i)}
          onMouseLeave={() => setActiveIndex(null)}
          role="button"
          onClick={() => onSetValue(`${getPercentFromIndex(i)}%`)}
          onKeyUp={() => onSetValue(`${getPercentFromIndex(i)}%`)}
          data-bs-offset="0,-7"
          title={`${getPercentFromIndex(i)}%`}
          aria-label={`${getPercentFromIndex(i)}%`}
          ref={(element) => {
            if (element && !bootstrap.Tooltip.getInstance(element)) {
              // eslint-disable-next-line no-new
              new bootstrap.Tooltip(element);
            }
          }}
        />
      ))}
    </div>
  );
};

export default PercentSelector;
