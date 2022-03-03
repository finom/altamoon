import React, {
  Dispatch, ReactElement, ReactNode, SetStateAction, useCallback, useRef,
} from 'react';
import { Button, Col, Row } from 'reactstrap';
import { listenChange } from 'use-change';

import Modal, { ModalHeader, ModalFooter, ModalBody } from '../Modal';

export interface WidgetSettingsProps {
  listenSettingsSave: (handler: () => void) => (() => void);
  listenSettingsCancel: (handler: () => void) => (() => void);
}

interface Props {
  settings?: ReactNode | ((settingsProps: WidgetSettingsProps) => ReactNode);
  isSettingsOpen: boolean;
  setIsSettignsOpen: Dispatch<SetStateAction<boolean>>;
  canSettingsSave?: boolean;
  onSettingsCancel?: () => void;
  onSettingsSave?: () => void;
}

const WidgetSettingsModal = ({
  settings,
  isSettingsOpen,
  setIsSettignsOpen,
  canSettingsSave,
  onSettingsCancel,
  onSettingsSave,
}: Props): ReactElement => {
  const evtTargetRef = useRef({ saveCount: 0, cancelCount: 0 });
  const listenSettingsSave = useCallback((handler: () => void) => listenChange(evtTargetRef.current, 'saveCount', handler), []);
  const listenSettingsCancel = useCallback((handler: () => void) => listenChange(evtTargetRef.current, 'cancelCount', handler), []);

  const toggleSettings = useCallback(() => {
    if (isSettingsOpen) {
      onSettingsCancel?.();
      evtTargetRef.current.cancelCount += 1;
    }
    setIsSettignsOpen(!isSettingsOpen);
  }, [isSettingsOpen, onSettingsCancel, setIsSettignsOpen]);

  const onSaveClick = useCallback(() => {
    onSettingsSave?.();
    evtTargetRef.current.saveCount += 1;
    setIsSettignsOpen(false);
  }, [onSettingsSave, setIsSettignsOpen]);

  const closeModal = useCallback(() => setIsSettignsOpen(false), [setIsSettignsOpen]);

  return (
    <Modal isOpen={isSettingsOpen} onRequestClose={closeModal}>
      <ModalHeader onRequestClose={closeModal}>Settings</ModalHeader>
      <ModalBody>
        {typeof settings === 'function' ? settings({ listenSettingsSave, listenSettingsCancel }) : settings}
      </ModalBody>
      <ModalFooter>
        <Row style={{ flex: 1 }}>
          <Col xs={6}>
            {canSettingsSave !== false && (
            <Button
              color="info"
              block
              className="mt-3"
              onClick={onSaveClick}
            >
              Save
            </Button>
            )}
          </Col>
          <Col xs={6} className="text-end">
            <Button
              color="secondary"
              block
              className="mt-3"
              onClick={toggleSettings}
            >
              {canSettingsSave !== false ? 'Cancel' : 'Close'}
            </Button>
          </Col>
        </Row>
      </ModalFooter>
    </Modal>
  );
};

export default WidgetSettingsModal;
