/* import Store from 'electron-store';
import { Layout } from 'react-grid-layout';

interface StoreType {
  layout: Layout[]
}

const schema = {
  binanceApiKey: { type: 'string' },
  binanceApiSecret: { type: 'string' },
  layout: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        x: { type: 'number' },
        y: { type: 'number' },
        w: { type: 'number' },
        h: { type: 'number' },
      },
    },
  },
} as const;

export default new Store<StoreType>({ schema });
*/

import { Layout } from 'react-grid-layout';

interface StoreData {
  layout: Layout[]
}

const defaults: StoreData = { layout: [] };

export default class PersistentStore {
  public static get(key: keyof StoreData): StoreData[typeof key] {
    const strValue = localStorage.getItem(key);

    return strValue
      ? JSON.parse(strValue) as StoreData[typeof key]
      : defaults[key];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static set(key: keyof StoreData, value: StoreData[typeof key]): void {
    localStorage.setItem(key, JSON.stringify(value));
  }
}
