import React, { ReactElement, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import {
  Button, Form, Input, Label,
} from 'reactstrap';
import useChange from 'use-change';
import isType from '../lib/isType';
import { RootStore } from '../store';
import Modal, { ModalHeader, ModalFooter, ModalBody } from './layout/Modal';

const fakeSecretValue = Array(50).fill('1').join('');

const SettingsModal = (): ReactElement => {
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useChange<RootStore, 'isSettingsModalOpen'>('isSettingsModalOpen');
  const [existingApiKey, setApiKey] = useChange(({ persistent }: RootStore) => persistent, 'binanceApiKey');
  const [existingApiSecret, setApiSecret] = useChange(({ persistent }: RootStore) => persistent, 'binanceApiSecret');
  const [existingTheme, setTheme] = useChange(({ persistent }: RootStore) => persistent, 'theme');
  const closeModal = useCallback(() => {
    setIsSettingsModalOpen(false);
  }, [setIsSettingsModalOpen]);
  const {
    register, handleSubmit, getValues,
  } = useForm<Pick<RootStore['persistent'], 'binanceApiKey' | 'binanceApiSecret' | 'theme'>>();
  const onSubmit = handleSubmit(useCallback(() => {
    const { binanceApiKey, binanceApiSecret, theme } = getValues();
    setTheme(theme);
    setApiKey(binanceApiKey);
    if (binanceApiSecret !== fakeSecretValue) {
      setApiSecret(binanceApiSecret);
    }
    closeModal();
  }, [closeModal, getValues, setApiKey, setApiSecret, setTheme]));

  return (
    <Modal isOpen={isSettingsModalOpen} onRequestClose={closeModal}>
      <ModalHeader onRequestClose={closeModal}>Settings</ModalHeader>
      <ModalBody>
        <Form id="settings" onSubmit={onSubmit}>
          <Label
            htmlFor={isType<keyof RootStore['persistent']>('theme')}
            className="form-label"
          >
            Binance API Key
          </Label>
          <Input
            type="select"
            name={isType<keyof RootStore['persistent']>('theme')}
            id={isType<keyof RootStore['persistent']>('theme')}
            innerRef={register}
            className="mb-3"
            defaultValue={existingTheme}
          >
            <option value="default">Default</option>
            <option value="dark">Dark</option>
          </Input>

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
