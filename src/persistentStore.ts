import Store from 'electron-store';
import { Layout } from 'react-grid-layout';

interface StoreType {
  layout: Layout[]
}

const schema = {
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
