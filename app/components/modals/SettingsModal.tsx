import React, { ReactElement, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import {
  Button, Form, Input, Label, Row, Col,
} from 'reactstrap';
import useChange from 'use-change';
import isType from '../../lib/isType';
import { PERSISTENT, ROOT, RootStore } from '../../store';
import Modal, { ModalHeader, ModalFooter, ModalBody } from '../layout/Modal';

const fakeSecretValue = Array(50).fill('1').join('');

const SettingsModal = (): ReactElement => {
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useChange(ROOT, 'isSettingsModalOpen');
  const [existingNumberOfColumns, setNumberOfColumns] = useChange(PERSISTENT, 'numberOfColumns');
  const [existingApiKey, setApiKey] = useChange(PERSISTENT, 'binanceApiKey');
  const [existingApiSecret, setApiSecret] = useChange(PERSISTENT, 'binanceApiSecret');
  const [existingTheme, setTheme] = useChange(PERSISTENT, 'theme');
  const closeModal = useCallback(() => {
    setIsSettingsModalOpen(false);
  }, [setIsSettingsModalOpen]);
  const {
    register, handleSubmit, getValues,
  } = useForm<Pick<RootStore['persistent'], 'numberOfColumns' | 'binanceApiKey' | 'binanceApiSecret' | 'theme'>>();
  const onSubmit = handleSubmit(useCallback(() => {
    const {
      numberOfColumns, binanceApiKey, binanceApiSecret, theme,
    } = getValues();
    const colsNum = Math.abs(+numberOfColumns || 12);
    setNumberOfColumns(colsNum > 60 ? 60 : colsNum);
    setTheme(theme);
    setApiKey(binanceApiKey);
    if (binanceApiSecret !== fakeSecretValue) {
      setApiSecret(binanceApiSecret);
    }
    closeModal();
  }, [closeModal, getValues, setApiKey, setApiSecret, setNumberOfColumns, setTheme]));

  return (
    <Modal isOpen={isSettingsModalOpen} onRequestClose={closeModal}>
      <ModalHeader onRequestClose={closeModal}>Settings</ModalHeader>
      <ModalBody>
        <Form id="settings" onSubmit={onSubmit}>
          <Row>
            <Col xs={6}>
              <Label
                htmlFor={isType<keyof RootStore['persistent']>('theme')}
                className="form-label"
              >
                Theme
              </Label>
              <Input
                type="select"
                name={isType<keyof RootStore['persistent']>('theme')}
                id={isType<keyof RootStore['persistent']>('theme')}
                innerRef={register}
                className="mb-3 form-control"
                defaultValue={existingTheme}
              >
                <option value={isType<RootStore['persistent']['theme']>('light')}>Light</option>
                <option value={isType<RootStore['persistent']['theme']>('dark')}>Dark</option>
              </Input>
            </Col>
            <Col xs={6}>
              <Label
                htmlFor={isType<keyof RootStore['persistent']>('binanceApiKey')}
                className="form-label"
              >
                Number of columns
              </Label>
              <Input
                name={isType<keyof RootStore['persistent']>('numberOfColumns')}
                id={isType<keyof RootStore['persistent']>('numberOfColumns')}
                type="number"
                innerRef={register}
                placeholder="Number of columns"
                defaultValue={existingNumberOfColumns}
                className="mb-3"
              />
            </Col>
          </Row>
          <Label
            htmlFor={isType<keyof RootStore['persistent']>('binanceApiKey')}
            className="form-label"
          >
            Binance API Key
          </Label>
          <Input
            name={isType<keyof RootStore['persistent']>('binanceApiKey')}
            id={isType<keyof RootStore['persistent']>('binanceApiKey')}
            innerRef={register}
            placeholder="Binance API Key"
            defaultValue={existingApiKey ?? ''}
            className="mb-3"
          />

          <Label
            htmlFor={isType<keyof RootStore['persistent']>('binanceApiSecret')}
            className="form-label"
          >
            Binance API Secret
          </Label>
          <Input
            name={isType<keyof RootStore['persistent']>('binanceApiSecret')}
            id={isType<keyof RootStore['persistent']>('binanceApiSecret')}
            innerRef={register}
            defaultValue={existingApiSecret ? fakeSecretValue : ''}
            placeholder="Binance API Secret"
            type="password"
          />
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button form="settings" type="submit" color="primary">Save</Button>
      </ModalFooter>
    </Modal>
  );
};

export default SettingsModal;
