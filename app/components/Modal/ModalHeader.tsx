import React, { ReactElement, ReactNode } from 'react';

import css from './style.css';

interface Props {
  children?: ReactNode,
  title?: ReactElement | string,
  className?: string,

  onRequestClose: () => void,
}

const ModalHeader = ({
  children,
  title,
  className,

  onRequestClose,
}: Props): ReactElement => (
  <div className={`modal-header d-block ${className || ''}`}>
    {!!onRequestClose && (
    <button
      type="button"
      className={`${css.closeButton} close`}
      aria-label="Close"
      onClick={onRequestClose}
    >
      <span aria-hidden="true">
        ×
      </span>
    </button>
    )}
    {!!title && (
    <h4
      className="modal-title"
    >
      {title}
    </h4>
    )}
    {children}
  </div>
);

export default ModalHeader;
