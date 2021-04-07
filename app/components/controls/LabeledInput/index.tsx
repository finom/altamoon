import React, { ReactElement, ReactNode } from 'react';

import css from './style.css';

interface Props {
  label: string;
  id: string;
  children?: ReactNode;
  type: 'text' | 'number';
  value: string;
  onChange: (value: string) => void;
}

const LabeledInput = ({
  label,
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
    {children}
  </div>
);

export default LabeledInput;
