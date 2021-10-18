import React, { ReactElement } from 'react';
import { Gear } from 'react-bootstrap-icons';
import { Button } from 'reactstrap';
import { useSet, useValue } from 'use-change';
import { PERSISTENT, ROOT } from '../../store';

const SettingsButton = ({ buttonTextClassName }: { buttonTextClassName: string }): ReactElement => {
  const theme = useValue(PERSISTENT, 'theme');
  const setIsSettingsModalOpen = useSet(ROOT, 'isSettingsModalOpen');

  return (
    <Button
      title="Settings"
      color={theme === 'dark' ? 'dark' : 'light'}
      onClick={() => setIsSettingsModalOpen(true)}
    >
      <Gear size={16} />
      {' '}
      <span className={buttonTextClassName}>Settings</span>
    </Button>
  );
};

export default SettingsButton;
