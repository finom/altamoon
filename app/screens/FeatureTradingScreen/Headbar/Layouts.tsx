import React, { ReactElement, useState } from 'react';
import {
  Dropdown, DropdownItem, DropdownMenu, DropdownToggle,
} from 'reactstrap';
import { useValue } from 'use-change';
import { LayoutWtf } from 'react-bootstrap-icons';

import { PERSISTENT } from '../../../store';

const Layouts = (): ReactElement => {
  const theme = useValue(PERSISTENT, 'theme');
  const [isDropdownOpen, onSetIsDropdownOpen] = useState(false);

  return (
    <div>
      <Dropdown isOpen={isDropdownOpen} toggle={() => { onSetIsDropdownOpen((v) => !v); }} active>
        <DropdownToggle
          className="ms-auto"
          color={theme === 'dark' ? 'dark' : 'light'}
          title="Layouts"
        >
          <LayoutWtf size={16} />
          {' '}
          <span className="d-none d-xxl-inline-block">Layouts</span>
        </DropdownToggle>
        <DropdownMenu>
          <DropdownItem header>
            Header
          </DropdownItem>
          <DropdownItem>
            Some Action
          </DropdownItem>
          <DropdownItem text>
            Dropdown Item Text
          </DropdownItem>
          <DropdownItem disabled>
            Action (disabled)
          </DropdownItem>
          <DropdownItem divider />
          <DropdownItem>
            Foo Action
          </DropdownItem>
          <DropdownItem>
            Bar Action
          </DropdownItem>
          <DropdownItem>
            Quo Action
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};

export default Layouts;
