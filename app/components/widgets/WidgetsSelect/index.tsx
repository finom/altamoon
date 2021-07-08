import classNames from 'classnames';
import { keyBy } from 'lodash';
import React, {
  LegacyRef, ReactElement, useEffect, useRef, useState,
} from 'react';
import { UiChecksGrid } from 'react-bootstrap-icons';

import { Button } from 'reactstrap';
import useChange, { useValue } from 'use-change';
import { RootStore } from '../../../store';
import FormSwitch from '../../controls/FormSwitch';

import css from './style.css';

const WidgetsSelect = (): ReactElement => {
  const [isWidgetListVisible, setIsWidgetListVisible] = useState(false);
  const theme = useValue(({ persistent }: RootStore) => persistent, 'theme');
  const builtInWidgets = useValue(({ app }: RootStore) => app, 'builtInWidgets');
  const pluginWidgets = useValue(({ app }: RootStore) => app, 'pluginWidgets');
  const defaultPlugins = useValue(({ app }: RootStore) => app, 'defaultPlugins');
  const customPlugins = useValue(({ app }: RootStore) => app, 'customPlugins');
  const [widgetsDisabled, setWidgetsDisabled] = useChange(({ persistent }: RootStore) => persistent, 'widgetsDisabled');
  const customPluginsMap = keyBy([...defaultPlugins, ...customPlugins], 'id');
  const ref = useRef<HTMLDivElement>();
  const onChange = (id: string, isChecked: boolean) => {
    if (isChecked) {
      setWidgetsDisabled(widgetsDisabled.filter((w) => w !== id));
    } else {
      setWidgetsDisabled([...widgetsDisabled, id]);
    }
  };

  // listen click outside
  useEffect(() => {
    const handler = ({ target }: MouseEvent) => {
      if (!ref.current?.contains(target as Node)) {
        setIsWidgetListVisible(false);
      }
    };

    document.addEventListener('click', handler);

    return () => document.removeEventListener('click', handler);
  });

  return (
    <div className="d-inline-block position-relative" ref={ref as LegacyRef<HTMLDivElement>}>
      <Button
        color={theme === 'dark' ? 'dark' : 'light'}
        onClick={() => setIsWidgetListVisible((v) => !v)}
      >
        <UiChecksGrid size={16} />
        {' '}
        Widgets
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
