import React, { ReactElement, useCallback, useState } from 'react';
import { QuestionCircleFill } from 'react-bootstrap-icons';
import {
  Button, Form, Input, Label, Collapse,
} from 'reactstrap';
import useChange, { useGet } from 'use-change';
import isType from '../../../lib/isType';
import { PERSISTENT, ROOT, RootStore } from '../../../store';
import FormSwitch from '../../controls/FormSwitch';
import Modal, { ModalHeader, ModalFooter, ModalBody } from '../../layout/Modal';
import ExportImport, { SettingsFileObject } from './ExportImport';

const SettingsModal = (): ReactElement => {
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useChange(ROOT, 'isSettingsModalOpen');
  const [existingApiKey, setExistingApiKey] = useChange(PERSISTENT, 'binanceApiKey');
  const [existingApiSecret, setExistingApiSecret] = useChange(PERSISTENT, 'binanceApiSecret');
  const [existingTestnetApiKey, setExistingTestnetApiKey] = useChange(PERSISTENT, 'testnetBinanceApiKey');
  const [existingTestnetApiSecret, setExistingTestnetApiSecret] = useChange(PERSISTENT, 'testnetBinanceApiSecret');
  const [existingIsTestnet, setExistingIsTestnet] = useChange(PERSISTENT, 'isTestnet');
  const closeModal = useCallback(() => {
    setIsSettingsModalOpen(false);
  }, [setIsSettingsModalOpen]);
  const getSettings = useGet(ROOT, 'persistent');
  const getMinicharts = useGet(ROOT, 'minicharts');

  const [binanceApiKey, setBinanceApiKey] = useState(existingApiKey ?? '');
  const [binanceApiSecret, setBinanceApiSecret] = useState(existingApiSecret ?? '');
  const [isTestnet, setIsTestnet] = useState(existingIsTestnet);
  const [testnetBinanceApiKey, setTestnetBinanceApiKey] = useState(existingTestnetApiKey ?? '');
  const [testnetBinanceApiSecret, setTestnetBinanceApiSecret] = useState(existingTestnetApiSecret ?? '');

  const [setingsFileObject, setSettingsFileObject] = useState<SettingsFileObject | null>(null);

  const onSubmit = useCallback(() => {
    if (setingsFileObject?.fileType === 'altamoon-settings') {
      Object.assign(getSettings(), setingsFileObject.settings);
      Object.assign(getMinicharts(), setingsFileObject.minichartsSettings);

      closeModal();
      return;
    }
    setExistingIsTestnet(isTestnet);
    setExistingApiKey(binanceApiKey);
    setExistingTestnetApiKey(testnetBinanceApiKey);
    setExistingApiSecret(binanceApiSecret);
    setExistingTestnetApiSecret(testnetBinanceApiSecret);

    closeModal();
  }, [
    binanceApiKey, binanceApiSecret, closeModal, isTestnet, setExistingApiKey,
    setExistingApiSecret, setExistingIsTestnet, setExistingTestnetApiKey,
    setExistingTestnetApiSecret, testnetBinanceApiKey,
    testnetBinanceApiSecret, getSettings, setingsFileObject, getMinicharts,
  ]);

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
            placeholder="Binance API Key"
            value={binanceApiKey}
            onChange={({ target }) => setBinanceApiKey(target.value)}
            className="mb-3"
            disabled={isTestnet}
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
            value={binanceApiSecret}
            onChange={({ target }) => setBinanceApiSecret(target.value)}
            placeholder="Binance API Secret"
            disabled={isTestnet}
            type="password"
          />
          <div className="mb-1">
            <Label
              htmlFor={isType<keyof RootStore['persistent']>('isTestnet')}
              className="form-label mt-3"
            >
              <FormSwitch
                className="float-start"
                name={isType<keyof RootStore['persistent']>('isTestnet')}
                id={isType<keyof RootStore['persistent']>('isTestnet')}
                isChecked={isTestnet}
                onChange={setIsTestnet}
              />

              Test trading with Binance testnet
            </Label>
            {' '}
            &nbsp;
            <a href="https://dev.binance.vision/t/binance-testnet-environments/99/3" target="_blank" rel="noreferrer">
              <QuestionCircleFill />
            </a>
          </div>
          <Collapse isOpen={isTestnet}>
            <Label
              htmlFor={isType<keyof RootStore['persistent']>('testnetBinanceApiKey')}
              className="form-label"
            >
              Binance Testnet API Key
            </Label>
            <Input
              name={isType<keyof RootStore['persistent']>('testnetBinanceApiKey')}
              id={isType<keyof RootStore['persistent']>('testnetBinanceApiKey')}
              placeholder="Binance Testnet API Key"
              value={testnetBinanceApiKey}
              onChange={({ target }) => setTestnetBinanceApiKey(target.value)}
              className="mb-3"
            />
            <Label
              htmlFor={isType<keyof RootStore['persistent']>('testnetBinanceApiSecret')}
              className="form-label"
            >
              Binance Testnet API Secret
            </Label>
            <Input
              name={isType<keyof RootStore['persistent']>('testnetBinanceApiSecret')}
              id={isType<keyof RootStore['persistent']>('testnetBinanceApiSecret')}
              value={testnetBinanceApiSecret}
              onChange={({ target }) => setTestnetBinanceApiSecret(target.value)}
              placeholder="Binance Testnet API Secret"
              type="password"
            />
          </Collapse>
          <ExportImport
            isSettingsModalOpen={isSettingsModalOpen}
            setingsFileObject={setingsFileObject}
            setSettingsFileObject={setSettingsFileObject}
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
