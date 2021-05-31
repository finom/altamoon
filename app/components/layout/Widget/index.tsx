import React, {
  ReactElement, ReactNode, Ref, useCallback, useState,
} from 'react';
import {
  Button, Card, CardBody, CardHeader,
} from 'reactstrap';
import classNames from 'classnames';
import { Gear } from 'react-bootstrap-icons';
import { useValue } from 'use-change';

import css from './style.css';
import { RootStore } from '../../../store';
import AccountError from './AccountError';

interface Props {
  title: string;
  noPadding?: boolean;
  bodyClassName?: string;
  settings?: ReactNode;
  children?: ReactNode;
  bodyRef?: Ref<HTMLElement>;
  checkAccount?: boolean;
  onSettingsClose?: () => void;
  onSettingsSave?: () => void;
}

const Widget = ({
  title, noPadding, bodyClassName, settings, children,
  bodyRef, checkAccount, onSettingsClose, onSettingsSave,
}: Props): ReactElement => {
  const [isSettingsOpen, setIsSettignsOpen] = useState(false);
  const futuresAccount = useValue(({ account }: RootStore) => account, 'futuresAccount');

  const toggleSettings = useCallback(() => {
    if (isSettingsOpen) {
      onSettingsClose?.();
    }
    setIsSettignsOpen(!isSettingsOpen);
  }, [isSettingsOpen, onSettingsClose]);

  const onSaveClick = useCallback(() => {
    onSettingsSave?.();
    setIsSettignsOpen(false);
  }, [onSettingsSave]);

  return (
    <Card className={css.card}>
      <CardHeader className={css.cardHeader}>
        {title}
        {!!settings && (
          <span
            className={css.settingsIcon}
            role="button"
            tabIndex={0}
            onClick={toggleSettings}
            onKeyDown={toggleSettings}
            onMouseDown={(evt) => evt.stopPropagation()}
          >
            <Gear size={16} />
          </span>
        )}
      </CardHeader>
      <CardBody
        innerRef={bodyRef}
        className={classNames({
          'p-0': !!noPadding,
          [css.cardBody]: true,
          [String(bodyClassName)]: !!bodyClassName,
        })}
      >
        {!!settings && (
        <div
          className={classNames({
            'card-body': true,
            [css.settings]: true,
            [css.settingsOpen]: isSettingsOpen,
          })}
        >
          {settings}
          <Button
            color="info"
            className="mt-3"
            onClick={onSaveClick}
          >
            Save
          </Button>
        </div>
        )}

        {!checkAccount || futuresAccount ? children : <AccountError />}
      </CardBody>
    </Card>
  );
};

export default Widget;
