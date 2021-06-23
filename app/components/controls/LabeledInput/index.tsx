import React, { ReactElement, ReactNode, Ref } from 'react';

import css from './style.css';

interface Props {
  label: string;
  rightLabel?: string | ReactElement;
  rightLabelClassName?: string;
  id: string;
  children?: ReactNode;
  type: 'text' | 'number';
  value: string;
  innerRef?: Ref<HTMLInputElement>;
  onChange: (value: string) => void;
}

const LabeledInput = ({
  label,
  rightLabel,
  rightLabelClassName,
  children,
  id,
  type,
  value,
  innerRef,
  onChange,
}: Props): ReactElement => (
  <div className={`form-control labeled-input ${css.labeledInput}`}>
    <label htmlFor={id}>{label}</label>
    <input
      ref={innerRef}
      type={type}
      id={id}
      value={value}
      onChange={({ target }) => onChange(target.value)}
    />
    {rightLabel ? <label htmlFor={id} className={rightLabelClassName}>{rightLabel}</label> : null}
    {children}
  </div>
);

export default LabeledInput;
