import React, { ReactElement, ReactNode } from 'react';

import css from './style.css';

interface Props {
  label: string;
  rightLabel?: string;
  id: string;
  children?: ReactNode;
  type: 'text' | 'number';
  value: string;
  onChange: (value: string) => void;
}

const LabeledInput = ({
  label,
  rightLabel,
  children,
  id,
  type,
  value,
  onChange,
}: Props): ReactElement => (
  <div className={`form-control labeled-input ${css.labeledInput}`}>
    <label htmlFor={id}>{label}</label>
    <input
      type={type}
      id={id}
      value={value}
      onChange={({ target }) => onChange(target.value)}
    />
    {rightLabel ? <label htmlFor={id}>{rightLabel}</label> : null}
    {children}
  </div>
);

export default LabeledInput;
