import React, {
  ReactElement, ReactNode, Ref, useCallback, useRef, useState,
} from 'react';
import {
  Button, Card, CardBody, CardHeader, Row, Col,
} from 'reactstrap';
import classNames from 'classnames';
import { Gear } from 'react-bootstrap-icons';
import { listenChange, useValue } from 'use-change';

import css from './style.css';
import { ACCOUNT } from '../../../store';
import AccountError from './AccountError';
import useWidgetSizeBreakpoint from '../../../hooks/useWidgetSizeBreakpoint';

export interface WidgetSettingsProps {
  listenSettingsSave: (handler: () => void) => (() => void);
  listenSettingsCancel: (handler: () => void) => (() => void);
}
interface Props {
  id: string;
  title: string;
  canSettingsSave?: boolean;
  noPadding?: boolean;
  bodyClassName?: string;
  settings?: ReactNode | ((settingsProps: WidgetSettingsProps) => ReactNode);
  children?: ReactNode;
  bodyRef?: Ref<HTMLElement>;
  shouldCheckAccount?: boolean;
  onSettingsCancel?: () => void;
  onSettingsSave?: () => void;
}

const Widget = ({
  id, title, canSettingsSave, noPadding, bodyClassName, settings, children,
  bodyRef, shouldCheckAccount, onSettingsCancel, onSettingsSave,
}: Props): ReactElement => {
  const [isSettingsOpen, setIsSettignsOpen] = useState(false);
  const futuresAccount = useValue(ACCOUNT, 'futuresAccount');
  const [isWideLayout, wideLayoutRef] = useWidgetSizeBreakpoint('lg');
  const evtTargetRef = useRef({ saveCount: 0, cancelCount: 0 });
  const listenSettingsSave = useCallback((handler) => listenChange(evtTargetRef.current, 'saveCount', handler), []);
  const listenSettingsCancel = useCallback((handler) => listenChange(evtTargetRef.current, 'cancelCount', handler), []);

  const toggleSettings = useCallback(() => {
    if (isSettingsOpen) {
      onSettingsCancel?.();
      evtTargetRef.current.cancelCount += 1;
    }
    setIsSettignsOpen(!isSettingsOpen);
  }, [isSettingsOpen, onSettingsCancel]);

  const onSaveClick = useCallback(() => {
    onSettingsSave?.();
    evtTargetRef.current.saveCount += 1;
    setIsSettignsOpen(false);
  }, [onSettingsSave]);

  return (
    <Card className={css.card} innerRef={wideLayoutRef} data-widget-id={id}>
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
      {!!settings && (
        <CardBody
          className={classNames({
            [css.settings]: true,
            [css.settingsOpen]: isSettingsOpen,
          })}
        >
          {typeof settings === 'function' ? settings({ listenSettingsSave, listenSettingsCancel }) : settings}
          <Row>
            <Col xs={6}>
              {canSettingsSave !== false && (
                <Button
                  color="info"
                  block
                  className={`mt-3${!isWideLayout ? ' w-100' : ''}`}
                  onClick={onSaveClick}
                >
                  Save
                </Button>
              )}

            </Col>
            <Col xs={6} className="text-end">
              <Button
                color="secondary"
                className={`mt-3${!isWideLayout ? ' w-100' : ''}`}
                onClick={toggleSettings}
              >
                {canSettingsSave !== false ? 'Cancel' : 'Close'}
              </Button>
            </Col>
          </Row>
        </CardBody>
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
    </Card>
  );
};

export default Widget;
