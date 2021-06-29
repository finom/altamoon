import React, { ReactElement } from 'react';

interface Props {
  children: HTMLElement | null
}

const DOMElement = ({ children }: Props): ReactElement | null => (children ? (
  <div ref={(parent) => { parent?.appendChild(children); }} />
) : null);

export default DOMElement;
