import React, { ReactElement, Ref } from 'react';

interface Props {
  name?: string;
  id?: string;
  className?: string;
  isChecked?: boolean;
  defaultChecked?: boolean;
  innerRef?: Ref<HTMLInputElement>;
  onChange?: (isChecked: boolean) => void;
}

const FormSwitch = ({
  name, id, className, isChecked, defaultChecked, innerRef, onChange,
}: Props): ReactElement => (
  <div className={`form-check form-switch ${className || ''}`}>
    <input
      className="form-check-input cursor-pointer"
      type="checkbox"
      id={id}
      name={name}
      checked={isChecked}
      ref={innerRef}
      defaultChecked={defaultChecked}
      onChange={onChange ? ({ target }) => onChange(target.checked) : undefined}
    />
  </div>
);

export default FormSwitch;
