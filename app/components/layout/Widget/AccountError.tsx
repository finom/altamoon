import React, { ReactElement } from 'react';
import { useValue } from 'use-change';
import { RootStore } from '../../../store';
import SettingsButton from '../../controls/SettingsButton';

const AccountError = (): ReactElement => {
  const futuresAccountError = useValue(({ account }: RootStore) => account, 'futuresAccountError');
  return (
    <div className="d-flex flex-column align-items-center justify-content-center h-100">
      {futuresAccountError && (
      <div className="mb-3">
        Account Error:
        {' '}
        {futuresAccountError}
      </div>
      )}
      <SettingsButton />
    </div>
  );
};

export default AccountError;
