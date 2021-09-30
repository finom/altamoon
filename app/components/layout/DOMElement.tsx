import React, { ReactElement } from 'react';

interface Props {
  children: HTMLElement | null;
  className?: string;
}

const DOMElement = ({ children, className }: Props): ReactElement | null => (children ? (
  <div className={className} ref={(parent) => { parent?.appendChild(children); }} />
) : null);

export default DOMElement;
