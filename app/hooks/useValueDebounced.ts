import {
  ReturnTuple, StoreSlice,
} from 'use-change/dist/types';

import useChangeDebounced from './useChangeDebounced';

function useValueDebounced<STORE, KEY extends keyof SLICE, SLICE = STORE>(
  storeSlice: StoreSlice<STORE, SLICE>,
  key: KEY,
  delay = 300,
): ReturnTuple<SLICE[KEY]>[0] {
  return useChangeDebounced<STORE, KEY, SLICE>(storeSlice, key, delay)[0];
}

export default useValueDebounced;
