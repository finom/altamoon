/* eslint-disable jsx-a11y/no-noninteractive-element-to-interactive-role */
import React, {
  ReactElement, ReactNode, Ref,
} from 'react';

import css from './style.css';

interface Props {
  id: string;
  children?: ReactNode;
  value: string;
  innerRef?: Ref<HTMLInputElement>;
  className?: string;
  onPressEnter?: () => void;
  onChange: (value: string) => void;
  isPercentMode: boolean;
  setIsPercentMode: (value: boolean) => void;
}

const SizeInput = ({
  children,
  id,
  value,
  innerRef,
  className,
  onChange,
  onPressEnter,
  isPercentMode,
  setIsPercentMode,
}: Props): ReactElement => (
  <div className={`form-control ${css.sizeInput} ${className || ''}`}>
    <label htmlFor={id}>
      <span>
        <span
          onClick={() => setIsPercentMode(!isPercentMode)}
          onKeyDown={() => setIsPercentMode(!isPercentMode)}
          tabIndex={0}
          role="button"
        >
          {isPercentMode ? '%' : '$'}
        </span>
      </span>
    </label>
    <input
      ref={innerRef}
      type="text"
      id={id}
      value={value}
      onKeyDown={(evt) => {
        if (evt.key === 'Enter' && onPressEnter) {
          evt.preventDefault();
          onPressEnter();
        }
      }}
      onChange={({ target }) => {
        const { value: val } = target;
        if (val.includes('%')) {
          onChange(val.replace('%', ''));
          setIsPercentMode(true);
        } else if (val.includes('$')) {
          onChange(val.replace('$', ''));
          setIsPercentMode(false);
        } else {
          onChange(val);
        }
      }}
    />
    {children}
  </div>
);

export default SizeInput;
