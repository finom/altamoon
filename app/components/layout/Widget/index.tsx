import React, {
  ReactElement, ReactNode, Ref, useCallback, useRef, useState,
} from 'react';
import { Card, CardBody, CardHeader } from 'reactstrap';
import classNames from 'classnames';
import { Gear } from 'react-bootstrap-icons';
import { useValue } from 'use-change';

import css from './style.css';
import { ACCOUNT } from '../../../store';
import AccountError from './AccountError';
import WidgetSettingsModal, { WidgetSettingsProps } from './WidgetSettingsModal';

interface Props {
  id: string;
  title: string;
  canSettingsSave?: boolean;
  noPadding?: boolean;
  bodyClassName?: string;
  settings?: ReactNode | ((settingsProps: WidgetSettingsProps) => ReactNode);
  children?: ReactNode;
  after?: ReactNode;
  bodyRef?: Ref<HTMLElement>;
  shouldCheckAccount?: boolean;
  onSettingsCancel?: () => void;
  onSettingsSave?: () => void;
}

const Widget = ({
  id, title, canSettingsSave, noPadding, bodyClassName, settings, children, after,
  bodyRef, shouldCheckAccount, onSettingsCancel, onSettingsSave,
}: Props): ReactElement => {
  const [isSettingsOpen, setIsSettignsOpen] = useState(false);
  const futuresAccount = useValue(ACCOUNT, 'futuresAccount');
  const evtTargetRef = useRef({ saveCount: 0, cancelCount: 0 });

  const toggleSettings = useCallback(() => {
    if (isSettingsOpen) {
      onSettingsCancel?.();
      evtTargetRef.current.cancelCount += 1;
    }
    setIsSettignsOpen(!isSettingsOpen);
  }, [isSettingsOpen, onSettingsCancel]);

  return (
    <Card className={css.card} data-widget-id={id}>
      <CardHeader className={css.cardHeader}>
        {title}
        {!!settings && (
          <span
            className={css.settingsIcon}
            role="button"
            tabIndex={0}
            onClick={toggleSettings}
            onTouchEnd={toggleSettings}
            onKeyDown={toggleSettings}
            onMouseDown={(evt) => evt.stopPropagation()}
          >
            <Gear size={16} />
          </span>
        )}
      </CardHeader>
      {!!settings && (
        <WidgetSettingsModal
          settings={settings}
          isSettingsOpen={isSettingsOpen}
          setIsSettignsOpen={setIsSettignsOpen}
          canSettingsSave={canSettingsSave}
          onSettingsCancel={onSettingsCancel}
          onSettingsSave={onSettingsSave}
        />
      )}
      <CardBody
        innerRef={bodyRef}
        className={classNames({
          'p-0': !!noPadding,
          [css.cardBody]: true,
          [String(bodyClassName)]: !!bodyClassName,
        })}
      >
        {!shouldCheckAccount || futuresAccount ? children : <AccountError />}
      </CardBody>
      {after}
    </Card>
  );
};

export default Widget;
