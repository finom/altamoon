import React, { ReactElement } from 'react';
import { Gear } from 'react-bootstrap-icons';
import { Button } from 'reactstrap';
import { useSet } from 'use-change';
import { ROOT } from '../../store';

const SettingsButton = ({
  className, buttonTextClassName,
}: { className?: string; buttonTextClassName?: string }): ReactElement => {
  const setIsSettingsModalOpen = useSet(ROOT, 'isSettingsModalOpen');

  return (
    <Button
      title="Settings"
      color="dark"
      onClick={() => setIsSettingsModalOpen(true)}
      className={className}
    >
      <Gear size={16} />
      {' '}
      <span className={buttonTextClassName}>Settings</span>
    </Button>
  );
};

export default SettingsButton;
