import React, { ReactElement, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import {
  Button, Form, Input, Label,
} from 'reactstrap';
import useChange from '../hooks/useChange';
import isType from '../lib/isType';
import { RootStore } from '../lib/store';
import Modal, { ModalHeader, ModalFooter, ModalBody } from './Modal';

const fakeSecretValue = Array(50).fill('1').join('');

const SettingsModal = (): ReactElement => {
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useChange<RootStore, 'isSettingsModalOpen'>('isSettingsModalOpen');
  const [existingApiKey, setApiKey] = useChange(({ persistent }: RootStore) => persistent, 'binanceApiKey');
  const [existingApiSecret, setApiSecret] = useChange(({ persistent }: RootStore) => persistent, 'binanceApiSecret');
  const closeModal = useCallback(() => {
    setIsSettingsModalOpen(false);
  }, [setIsSettingsModalOpen]);
  const {
    register, handleSubmit, getValues,
  } = useForm<Pick<RootStore['persistent'], 'binanceApiKey' | 'binanceApiSecret'>>();
  const onSubmit = handleSubmit(useCallback(() => {
    const { binanceApiKey, binanceApiSecret } = getValues();
    setApiKey(binanceApiKey);
    if (binanceApiSecret !== fakeSecretValue) {
      setApiSecret(binanceApiSecret);
    }
    closeModal();
  }, [closeModal, getValues, setApiKey, setApiSecret]));

  return (
    <Modal isOpen={isSettingsModalOpen} onRequestClose={closeModal}>
      <ModalHeader onRequestClose={closeModal}>Settings</ModalHeader>
      <ModalBody>
        <Form id="settings" onSubmit={onSubmit}>
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
