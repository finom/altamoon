/* eslint-disable max-classes-per-file */
import { Layout } from 'react-grid-layout';
import { onChange } from '../hooks/useChange';

function persistentValue<T>(key: keyof PersistentStore, defaultValue: T) {
  const storageValue = localStorage.getItem(key);
  return storageValue ? JSON.parse(storageValue) as T : defaultValue;
}

class PersistentStore {
  public layout = persistentValue<Layout[]>('layout', []);

  public binanceApiKey = persistentValue<string | null>('binanceApiKey', null);

  public binanceApiSecret = persistentValue<string | null>('binanceApiSecret', null);

  constructor() {
    Object.getOwnPropertyNames(this).forEach((key) => {
      onChange(this, key, (value) => {
        localStorage.setItem(key, JSON.stringify(value));
      });
    });
  }
}

const persistent = new PersistentStore();

export class RootStore {
  persistent = persistent;

  isSettingsModalOpen = !persistent.binanceApiKey;
}

export default new RootStore();
