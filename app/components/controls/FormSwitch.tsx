import React, { ReactElement } from 'react';

interface Props {
  className?: string;
  isChecked: boolean;
  onChange: (isChecked: boolean) => void;
}

const FormSwitch = ({ className, isChecked, onChange }: Props): ReactElement => (
  <div className={`form-check form-switch ${className || ''}`}>
    <input
      className="form-check-input cursor-pointer"
      type="checkbox"
      checked={isChecked}
      onChange={({ target }) => onChange(target.checked)}
    />
  </div>
);

export default FormSwitch;
