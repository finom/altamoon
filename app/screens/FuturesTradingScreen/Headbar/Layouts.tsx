import React, { ReactElement, useState } from 'react';
import {
  Dropdown, DropdownItem, DropdownMenu, DropdownToggle,
} from 'reactstrap';
import { useSilent, useValue } from 'use-change';
import {
  ArrowCounterclockwise, LayoutWtf, PlusLg, Trash,
} from 'react-bootstrap-icons';

import { PERSISTENT } from '../../../store';
import NewLayoutModal from './NewLayoutModal';

const Layouts = (): ReactElement => {
  const theme = useValue(PERSISTENT, 'theme');
  const widgetLayouts = useValue(PERSISTENT, 'widgetLayouts');
  const deleteLayout = useSilent(PERSISTENT, 'deleteLayout');
  const resetLayout = useSilent(PERSISTENT, 'resetLayout');
  const enableLayout = useSilent(PERSISTENT, 'enableLayout');

  const [isDropdownOpen, onSetIsDropdownOpen] = useState(false);
  const [isNewLayoutModalOpen, setIsNewLayoutModalOpen] = useState(false);

  return (
    <div>
      <NewLayoutModal isOpen={isNewLayoutModalOpen} setIsOpen={setIsNewLayoutModalOpen} />
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
          {widgetLayouts.map(({ id, name }) => (
            <DropdownItem key={id} onClick={() => enableLayout(id)}>
              {name}
              {' '}
              {id !== 'DEFAULT' && (
                <Trash
                  className="float-end mt-1"
                  onClick={(evt) => {
                    evt.stopPropagation();
                    deleteLayout(id);
                  }}
                />
              )}
            </DropdownItem>
          ))}
          <DropdownItem divider />
          <DropdownItem onClick={resetLayout}>
            <ArrowCounterclockwise />
            {' '}
            Reset current layout
          </DropdownItem>
          <DropdownItem onClick={() => setIsNewLayoutModalOpen(true)}>
            <PlusLg />
            {' '}
            Add new
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};

export default Layouts;
