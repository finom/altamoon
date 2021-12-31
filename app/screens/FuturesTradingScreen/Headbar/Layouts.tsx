/* eslint-disable jsx-a11y/no-static-element-interactions, jsx-a11y/no-noninteractive-element-interactions */
import React, { ReactElement, useRef, useState } from 'react';
import {
  Dropdown, DropdownItem, DropdownMenu, DropdownToggle,
} from 'reactstrap';
import { useSilent, useValue } from 'use-change';
import {
  ArrowCounterclockwise, Download, LayoutWtf, PlusLg, Trash,
} from 'react-bootstrap-icons';

import { PERSISTENT } from '../../../store';
import NewLayoutModal, { LayoutFileObject } from './NewLayoutModal';
import { AltamoonLayout } from '../../../store/types';
import useClickOutside from '../../../hooks/useClickOutside';

const LayoutItem = ({
  id, name, isEnabled, individualLayouts,
}: AltamoonLayout) => {
  const deleteLayout = useSilent(PERSISTENT, 'deleteLayout');
  const enableLayout = useSilent(PERSISTENT, 'enableLayout');

  return (
    <DropdownItem text key={id} className="text-nowrap">
      <Download
        className="float-end mt-2 muted-control"
        onClick={() => {
          const a = document.createElement('a');
          const layoutObject: LayoutFileObject = {
            fileType: 'altamoon-layout',
            name,
            individualLayouts,
          };
          const blob = new Blob([JSON.stringify(layoutObject)], { type: 'application/json' });
          a.href = window.URL.createObjectURL(blob);
          a.download = `${name.replace(/[^A-z0-9]/g, '_').toLowerCase()}.altamoon-layout.json`;
          a.click();
        }}
      />
      {id !== 'DEFAULT' && (
        <Trash
          className="float-end mt-2 muted-control me-2"
          onClick={(evt) => {
            evt.stopPropagation();
            deleteLayout(id);
          }}
        />
      )}
      <div className="form-check pe-5">
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
  );
};

const Layouts = (): ReactElement => {
  const theme = useValue(PERSISTENT, 'theme');
  const widgetLayouts = useValue(PERSISTENT, 'widgetLayouts');
  const resetLayout = useSilent(PERSISTENT, 'resetLayout');
  const ref = useRef<HTMLDivElement | null>(null);

  const [isDropdownOpen, onSetIsDropdownOpen] = useState(false);
  const [isNewLayoutModalOpen, setIsNewLayoutModalOpen] = useState(false);

  useClickOutside(ref, () => onSetIsDropdownOpen(false));

  return (
    <div ref={ref}>
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
          {widgetLayouts.map(({
            id, name, isEnabled, individualLayouts,
          }) => (
            <LayoutItem
              key={id}
              id={id}
              name={name}
              isEnabled={isEnabled}
              individualLayouts={individualLayouts}
            />
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
