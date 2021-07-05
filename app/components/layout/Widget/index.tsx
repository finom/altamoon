import React, {
  ReactElement, ReactNode, Ref, useCallback, useState,
} from 'react';
import {
  Button, Card, CardBody, CardHeader, Row, Col,
} from 'reactstrap';
import classNames from 'classnames';
import { Gear } from 'react-bootstrap-icons';
import { useValue } from 'use-change';

import css from './style.css';
import { RootStore } from '../../../store';
import AccountError from './AccountError';
import useWidgetSizeBreakpoint from '../../../hooks/useWidgetSizeBreakpoint';

interface Props {
  title: string;
  noPadding?: boolean;
  bodyClassName?: string;
  settings?: ReactNode;
  children?: ReactNode;
  bodyRef?: Ref<HTMLElement>;
  shouldCheckAccount?: boolean;
  onSettingsCancel?: () => void;
  onSettingsSave?: () => void;
}

const Widget = ({
  title, noPadding, bodyClassName, settings, children,
  bodyRef, shouldCheckAccount, onSettingsCancel, onSettingsSave,
}: Props): ReactElement => {
  const [isSettingsOpen, setIsSettignsOpen] = useState(false);
  const futuresAccount = useValue(({ account }: RootStore) => account, 'futuresAccount');
  const [isWideLayout, wideLayoutRef] = useWidgetSizeBreakpoint('lg');

  const toggleSettings = useCallback(() => {
    if (isSettingsOpen) {
      onSettingsCancel?.();
    }
    setIsSettignsOpen(!isSettingsOpen);
  }, [isSettingsOpen, onSettingsCancel]);

  const onSaveClick = useCallback(() => {
    onSettingsSave?.();
    setIsSettignsOpen(false);
  }, [onSettingsSave]);

  return (
    <Card className={css.card} innerRef={wideLayoutRef}>
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
          <Row>
            <Col xs={6}>
              <Button
                color="info"
                block
                className={`mt-3${!isWideLayout ? ' w-100' : ''}`}
                onClick={onSaveClick}
              >
                Save
              </Button>
            </Col>
            <Col xs={6} className="text-end">
              <Button
                color="secondary"
                className={`mt-3${!isWideLayout ? ' w-100' : ''}`}
                onClick={toggleSettings}
              >
                Cancel
              </Button>
            </Col>
          </Row>

        </div>
        )}

        {!shouldCheckAccount || futuresAccount ? children : <AccountError />}
      </CardBody>
    </Card>
  );
};

export default Widget;
