import React, { ReactElement, ReactNode } from 'react';

interface Props {
  children: ReactNode,
}

const ModalFooter = ({ children }: Props): ReactElement => (
  <div className="modal-footer">
    {children}
  </div>
);

export default ModalFooter;
