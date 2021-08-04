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
  className?: string;
  onPressEnter?: () => void;
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
  className,
  onChange,
  onPressEnter,
}: Props): ReactElement => (
  <div className={`form-control labeled-input ${css.labeledInput} ${className || ''}`}>
    <label htmlFor={id}>{label}</label>
    <input
      ref={innerRef}
      type={type}
      id={id}
      value={value}
      onKeyDown={(evt) => {
        if (evt.key === 'Enter' && onPressEnter) {
          evt.preventDefault();
          onPressEnter();
        }
      }}
      onChange={({ target }) => onChange(target.value)}
    />
    {rightLabel ? <label htmlFor={id} className={rightLabelClassName}>{rightLabel}</label> : null}
    {children}
  </div>
);

export default LabeledInput;
