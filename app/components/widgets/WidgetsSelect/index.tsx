import classNames from 'classnames';
import { keyBy } from 'lodash';
import React, {
  LegacyRef, ReactElement, useRef, useState,
} from 'react';
import { UiChecksGrid } from 'react-bootstrap-icons';

import { Button } from 'reactstrap';
import useChange, { useValue } from 'use-change';
import { CUSTOMIZATION, PERSISTENT } from '../../../store';
import FormSwitch from '../../controls/FormSwitch';
import useClickOutside from '../../../hooks/useClickOutside';

import css from './style.css';

interface Props {
  className?: string;
  buttonTextClassName: string;
}

const WidgetsSelect = ({ className, buttonTextClassName }: Props): ReactElement => {
  const [isWidgetListVisible, setIsWidgetListVisible] = useState(false);
  const theme = useValue(PERSISTENT, 'theme');
  const builtInWidgets = useValue(CUSTOMIZATION, 'builtInWidgets');
  const pluginWidgets = useValue(CUSTOMIZATION, 'pluginWidgets');
  const defaultPlugins = useValue(CUSTOMIZATION, 'defaultPlugins');
  const customPlugins = useValue(CUSTOMIZATION, 'customPlugins');
  const [widgetsDisabled, setWidgetsDisabled] = useChange(PERSISTENT, 'widgetsDisabled');
  const customPluginsMap = keyBy([...defaultPlugins, ...customPlugins], 'id');
  const ref = useRef<HTMLDivElement>();
  const onChange = (id: string, isChecked: boolean) => {
    if (isChecked) {
      setWidgetsDisabled(widgetsDisabled.filter((w) => w !== id));
    } else {
      setWidgetsDisabled([...widgetsDisabled, id]);
    }
  };

  useClickOutside(ref, () => setIsWidgetListVisible(false));

  return (
    <div className={`d-inline-block position-relative ${className ?? ''}`} ref={ref as LegacyRef<HTMLDivElement>}>
      <Button
        title="Widgets"
        color={theme === 'dark' ? 'dark' : 'light'}
        onClick={() => setIsWidgetListVisible((v) => !v)}
      >
        <UiChecksGrid size={16} />
        {' '}
        <span className={buttonTextClassName}>Widgets</span>
      </Button>

      <div
        className={classNames({
          [css.widgets]: true,
          'px-2 fade': true,
          'bg-dark': theme === 'dark',
          'bg-light': theme !== 'dark',
          'pe-none': !isWidgetListVisible, // pointer-events: none
          show: isWidgetListVisible,
        })}
      >
        {builtInWidgets.map(({ id, title }) => (
          <label key={id} className="text-ellipsis my-1 d-block">
            <FormSwitch
              className="d-inline-block align-middle"
              isChecked={!widgetsDisabled.includes(id)}
              onChange={(isChecked) => onChange(id, isChecked)}
            />
            {' '}
            {title}
          </label>
        ))}
        {pluginWidgets.map(({ id, title, pluginId }) => (
          <label key={id} className="text-ellipsis my-1 d-block">
            <FormSwitch
              className="d-inline-block align-middle"
              isChecked={!widgetsDisabled.includes(id)}
              onChange={(isChecked) => onChange(id, isChecked)}
            />
            {' '}
            {title}
            {' '}
            <em className="text-muted">
              (by
              {' '}
              {customPluginsMap[pluginId]?.name ?? 'Unknown plugin'}
              )
            </em>
          </label>
        ))}
      </div>
    </div>
  );
};
export default WidgetsSelect;
