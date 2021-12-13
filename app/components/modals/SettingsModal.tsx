import React, { ReactElement, useCallback } from 'react';
import { QuestionCircleFill } from 'react-bootstrap-icons';
import { useForm } from 'react-hook-form';
import {
  Button, Form, Input, Label, Row, Col, Collapse,
} from 'reactstrap';
import useChange from 'use-change';
import isType from '../../lib/isType';
import { PERSISTENT, ROOT, RootStore } from '../../store';
import FormSwitch from '../controls/FormSwitch';
import Modal, { ModalHeader, ModalFooter, ModalBody } from '../layout/Modal';

const SettingsModal = (): ReactElement => {
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useChange(ROOT, 'isSettingsModalOpen');
  const [existingNumberOfColumns, setNumberOfColumns] = useChange(PERSISTENT, 'numberOfColumns');
  const [existingApiKey, setApiKey] = useChange(PERSISTENT, 'binanceApiKey');
  const [existingApiSecret, setApiSecret] = useChange(PERSISTENT, 'binanceApiSecret');
  const [existingTestnetApiKey, setTestnetApiKey] = useChange(PERSISTENT, 'testnetBinanceApiKey');
  const [existingTestnetApiSecret, setTestnetApiSecret] = useChange(PERSISTENT, 'testnetBinanceApiSecret');
  const [existingTheme, setTheme] = useChange(PERSISTENT, 'theme');
  const [existingIsTestnet, setTestnet] = useChange(PERSISTENT, 'isTestnet');
  const closeModal = useCallback(() => {
    setIsSettingsModalOpen(false);
  }, [setIsSettingsModalOpen]);
  const {
    register, handleSubmit, getValues, watch,
  } = useForm<Pick<RootStore['persistent'], 'numberOfColumns' | 'binanceApiKey' | 'binanceApiSecret' | 'theme' | 'isTestnet' | 'testnetBinanceApiKey' | 'testnetBinanceApiSecret'>>();
  const onSubmit = handleSubmit(useCallback(() => {
    const {
      numberOfColumns,
      binanceApiKey,
      binanceApiSecret,
      theme,
      isTestnet,
      testnetBinanceApiKey,
      testnetBinanceApiSecret,
    } = getValues();
    const colsNum = Math.abs(+numberOfColumns || 120);
    setNumberOfColumns(colsNum > 120 ? 120 : colsNum);
    setTheme(theme);
    setTestnet(isTestnet);
    setApiKey(binanceApiKey);
    setTestnetApiKey(testnetBinanceApiKey);
    setApiSecret(binanceApiSecret);
    setTestnetApiSecret(testnetBinanceApiSecret);

    closeModal();
  }, [
    closeModal, getValues, setApiKey, setApiSecret, setNumberOfColumns,
    setTestnet, setTestnetApiKey, setTestnetApiSecret, setTheme,
  ]));
  const { isTestnet: formIsTestnet } = watch(['isTestnet']);

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
            disabled={formIsTestnet}
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
            defaultValue={existingApiSecret ?? ''}
            placeholder="Binance API Secret"
            disabled={formIsTestnet}
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
                defaultChecked={existingIsTestnet}
                innerRef={register}
              />

              Test trading with Binance testnet
            </Label>
            {' '}
            &nbsp;
            <a href="https://dev.binance.vision/t/binance-testnet-environments/99/3" target="_blank" rel="noreferrer">
              <QuestionCircleFill />
            </a>
          </div>
          <Collapse isOpen={formIsTestnet}>
            <Label
              htmlFor={isType<keyof RootStore['persistent']>('testnetBinanceApiKey')}
              className="form-label"
            >
              Binance Testnet API Key
            </Label>

            <Input
              name={isType<keyof RootStore['persistent']>('testnetBinanceApiKey')}
              id={isType<keyof RootStore['persistent']>('testnetBinanceApiKey')}
              innerRef={register}
              placeholder="Binance Testnet API Key"
              defaultValue={existingTestnetApiKey ?? ''}
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
              innerRef={register}
              defaultValue={existingTestnetApiSecret ?? ''}
              placeholder="Binance Testnet API Secret"
              type="password"
            />
          </Collapse>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button form="settings" type="submit" color="primary">Save</Button>
      </ModalFooter>
    </Modal>
  );
};

export default SettingsModal;
