import React, { ReactElement } from 'react';
import { Gear } from 'react-bootstrap-icons';
import { Button } from 'reactstrap';
import { useSet, useValue } from 'use-change';
import { RootStore } from '../../store';

const SettingsButton = (): ReactElement => {
  const theme = useValue(({ persistent }: RootStore) => persistent, 'theme');
  const setIsSettingsModalOpen = useSet((store: RootStore) => store, 'isSettingsModalOpen');

  return (
    <Button
      color={theme === 'dark' ? 'dark' : 'light'}
      onClick={() => setIsSettingsModalOpen(true)}
    >
      <Gear size={16} />
      {' '}
      Settings
    </Button>
  );
};

export default SettingsButton;
