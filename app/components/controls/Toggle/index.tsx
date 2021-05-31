import React, { ReactElement } from 'react';

import css from './style.css';

interface Props {
  id: string;
  checkedLabel: string;
  uncheckedLabel: string;
  className?: string;
  isChecked: boolean;
  onChange: (v: boolean) => void;
}

const Toggle = ({
  id, checkedLabel, uncheckedLabel, className, isChecked, onChange,
}: Props): ReactElement => (
  <div className={`${css.toggle} ${className || ''}`}>
    <input id={id} checked={isChecked} type="checkbox" onChange={({ target }) => onChange(target.checked)} />
    {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
    <label htmlFor={id}>
      <div className={css.switch} data-checked={checkedLabel} data-unchecked={uncheckedLabel} />
    </label>
  </div>
);

export default Toggle;
