import {
  Dropdown, DropdownToggle, DropdownMenu, DropdownItem,
} from 'reactstrap';
import React, { ReactElement, Dispatch, useState } from 'react';
import FormSwitch from '../../controls/FormSwitch';

export interface ColumnSelectorItem {
  id: string;
  display: string;
  title?: string;
}

interface Props {
  id: string;
  columns: readonly ColumnSelectorItem[];
  hiddenColumnIds: string[];
  setHiddenColumnIds: Dispatch<string[]>;
}

const ColumnSelector = ({
  id: selectorId,
  columns,
  hiddenColumnIds,
  setHiddenColumnIds,
}: Props): ReactElement => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Dropdown isOpen={isOpen} toggle={() => setIsOpen((v) => !v)}>
      <DropdownToggle caret className="empty" />
      <DropdownMenu>
        {columns.map(({ id, display }) => (
          <DropdownItem text key={id}>
            <label className="text-nowrap">
              <FormSwitch
                name={`column_selector_switch_${selectorId}_${id}`}
                id={`column_selector_switch_${selectorId}_${id}`}
                className="d-inline-block align-middle"
                onChange={(isChecked) => {
                  setHiddenColumnIds(
                    isChecked
                      ? hiddenColumnIds.filter((item) => item !== id)
                      : [...hiddenColumnIds, id],
                  );
                }}
                isChecked={!hiddenColumnIds.includes(id)}
                key={String(!hiddenColumnIds.includes(id))}
              />
              {' '}
              {display}
            </label>
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
};

export default ColumnSelector;
