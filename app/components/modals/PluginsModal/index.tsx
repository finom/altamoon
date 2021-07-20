import React, { ReactElement, useCallback, useState } from 'react';
import { Button } from 'reactstrap';
import { useSilent, useValue } from 'use-change';
import { CUSTOMIZATION, PERSISTENT } from '../../../store';
import Modal, { ModalHeader, ModalFooter, ModalBody } from '../../layout/Modal';
import Plugin from './Plugin';

interface Props {
  isOpen: boolean;
  onRequestClose: () => void;
}

const PluginsModal = ({ isOpen, onRequestClose }: Props): ReactElement => {
  const defaultPlugins = useValue(CUSTOMIZATION, 'defaultPlugins');
  const customPlugins = useValue(CUSTOMIZATION, 'customPlugins');
  const enablePlugin = useSilent(CUSTOMIZATION, 'enablePlugin');
  const disablePlugin = useSilent(CUSTOMIZATION, 'disablePlugin');
  const pluginsEnabled = useValue(PERSISTENT, 'pluginsEnabled');
  const [customPluginId, setCustomPluginId] = useState('');
  const createCustomPlugin = useCallback(async () => {
    if (customPluginId) {
      try {
        await enablePlugin(customPluginId.trim(), { isThirdParty: true, isDefault: false });
        setCustomPluginId('');
      } catch {}
    }
  }, [customPluginId, enablePlugin]);

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose}>
      <ModalHeader onRequestClose={onRequestClose}>Plugins</ModalHeader>
      <ModalBody>
        {defaultPlugins.map(({
          id, name, version, description, isThirdParty, isDevelopment,
        }) => (
          <Plugin
            key={id}
            id={id}
            name={name}
            version={version}
            description={description}
            isDefault
            isEnabled={pluginsEnabled.includes(id)}
            isThirdParty={isThirdParty}
            isDevelopment={isDevelopment}
            onEnablePlugin={() => enablePlugin(id, { isThirdParty, isDefault: true })}
            onDisablePlugin={disablePlugin}
          />
        ))}
        <hr />
        <label htmlFor="customPluginInput" className="mb-1">Add custom plugin</label>
        <div className="input-group mb-3">
          <input
            type="text"
            className="form-control"
            id="customPluginInput"
            spellCheck={false}
            value={customPluginId}
            placeholder="Script URL or NPM package name"
            aria-describedby="customPluginInputAddon"
            onChange={({ target }) => setCustomPluginId(target.value)}
            onKeyDown={({ key }) => {
              if (key === 'Enter') {
                void createCustomPlugin();
              }
            }}
          />
          <Button
            color="success"
            id="customPluginInputAddon"
            disabled={!customPluginId}
            onClick={createCustomPlugin}
          >
            Add Plugin
          </Button>
        </div>

        {customPlugins.map(({
          id, name, version, description, isDevelopment,
        }) => (
          <Plugin
            key={id}
            id={id}
            name={name}
            version={version}
            description={description}
            isDefault={false}
            isEnabled={pluginsEnabled.includes(id)}
            isThirdParty
            isDevelopment={isDevelopment}
            onEnablePlugin={() => enablePlugin(id, { isThirdParty: true, isDefault: false })}
            onDisablePlugin={disablePlugin}
          />
        ))}
      </ModalBody>
      <ModalFooter>
        <Button form="settings" color="secondary" onClick={onRequestClose}>Close</Button>
      </ModalFooter>
    </Modal>
  );
};

export default PluginsModal;
