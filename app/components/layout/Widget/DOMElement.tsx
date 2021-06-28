import React, { ReactElement } from 'react';

interface Props {
  children: HTMLElement
}

const DOMElement = ({ children }: Props): ReactElement => (
  <div ref={(parent) => {
    parent?.appendChild(children);
  }}
  />
);

export default DOMElement;
