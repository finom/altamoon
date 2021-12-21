/* eslint-disable jsx-a11y/no-static-element-interactions, jsx-a11y/no-noninteractive-element-interactions */
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
          <DropdownItem text>
            <span className="cursor-pointer" onClick={() => setIsNewLayoutModalOpen(true)} onKeyDown={() => setIsNewLayoutModalOpen(true)}>
              <PlusLg />
              {' '}
              Add new
            </span>

          </DropdownItem>
          <DropdownItem divider />
          {widgetLayouts.map(({ id, name, isEnabled }) => (
            <DropdownItem text key={id} className="text-nowrap">
              {id !== 'DEFAULT' && (
                <Trash
                  className="float-end mt-2 muted-control"
                  onClick={(evt) => {
                    evt.stopPropagation();
                    deleteLayout(id);
                  }}
                />
              )}
              <div className="form-check pe-4">
                <label className="form-check-label" onKeyDown={() => enableLayout(id)} onClick={() => enableLayout(id)}>
                  <input
                    className="form-check-input"
                    type="radio"
                    name="layout_radio"
                    value={id}
                    checked={isEnabled}
                    onChange={() => {}}
                  />
                  {name}
                </label>

              </div>

            </DropdownItem>
          ))}
          <DropdownItem divider />
          <DropdownItem text>
            <span className="cursor-pointer" role="button" tabIndex={0} onKeyDown={resetLayout} onClick={resetLayout}>
              <ArrowCounterclockwise />
              {' '}
              Reset current
            </span>
          </DropdownItem>

        </DropdownMenu>
      </Dropdown>
    </div>
  );
};

export default Layouts;
