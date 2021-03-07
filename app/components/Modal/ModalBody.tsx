import React, { ReactElement, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
}

const ModalBody = ({ children, className }: Props): ReactElement => (
  <div className={`modal-body ${className || ''}`}>
    {children}
  </div>
);

export default ModalBody;
