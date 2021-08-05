import { useContext, useEffect, useState } from 'react';
import { Context, listenChange } from 'use-change';

export type SliceRecord<SLICE> = SLICE & Partial<Record<keyof SLICE, unknown>>;

export type Key<SLICE, KEY> = keyof SLICE & string & KEY;

export type ReturnTuple<SLICE, KEY extends keyof SLICE>
  = [SLICE[KEY], (value: SLICE[KEY] | ((value: SLICE[KEY]) => SLICE[KEY])) => void];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Handler<SLICE = any, KEY = any> = (
  value: SLICE[Key<SLICE, KEY>],
  prev: SLICE[Key<SLICE, KEY>],
) => any; // eslint-disable-line @typescript-eslint/no-explicit-any
export interface Selector<STORE, SLICE> {
  (store: STORE): SliceRecord<SLICE>;
}

function useMultiValue<STORE, KEY, SLICE = STORE>(
  storeSlice: SliceRecord<SLICE>,
  keys: Key<SLICE, KEY>[],
): SliceRecord<SLICE>;

function useMultiValue<STORE, KEY, SLICE = STORE>(
  storeSlice: Selector<STORE, SLICE>,
  keys: Key<SLICE, KEY>[],
): ReturnType<Selector<STORE, SLICE>>;

function useMultiValue<STORE, KEY, SLICE = STORE>(
  storeSlice: SliceRecord<SLICE> | Selector<STORE, SLICE>,
  keys: Key<SLICE, KEY>[],
): unknown {
  const store = useContext<STORE>(Context);
  const slice: SliceRecord<SLICE> = typeof storeSlice === 'function' ? storeSlice(store) : storeSlice;
  const [, setForceUpdateBool] = useState<boolean>(true);

  useEffect(() => {
    const unlisten: (() => void)[] = [];

    keys.forEach((key) => {
      unlisten.push(listenChange(slice, key, () => setForceUpdateBool((b) => !b)));
    });

    return () => unlisten.forEach((un) => un());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keys.join(), slice]);

  return slice;
}

export default useMultiValue;
