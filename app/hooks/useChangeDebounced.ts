import {
  useCallback, useEffect, useRef, useState,
} from 'react';
import { listenChange } from 'use-change';
import useStoreSlice from 'use-change/dist/useStoreSlice';
import {
  ReturnTuple, StoreSlice,
} from 'use-change/dist/types';

function useChangeDebounced<STORE, KEY extends keyof SLICE, SLICE = STORE>(
  storeSlice: StoreSlice<STORE, SLICE>,
  key: KEY,
  delay = 300,
): ReturnTuple<SLICE[KEY]> {
  const slice = useStoreSlice(storeSlice);

  const [stateValue, setStateValue] = useState(slice[key]);

  const timeoutRef = useRef<NodeJS.Timeout | null>();
  const lastCalledRef = useRef<number>(0);

  type ValueFunction = (v: SLICE[KEY]) => SLICE[KEY];
  const setValue = useCallback(
    (value: SLICE[KEY] | ValueFunction) => {
      if (typeof value === 'function') {
        const valueFunction = value as ValueFunction;
        slice[key] = valueFunction(slice[key]);
      } else {
        slice[key] = value;
      }
    },
    [slice, key],
  );

  useEffect(() => {
    const handler = () => {
      const now = Date.now();
      const timeDiff = now - lastCalledRef.current;

      if (timeoutRef.current) return;

      if (timeDiff > delay) {
        lastCalledRef.current = now;
        setStateValue(slice[key]);
      } else {
        timeoutRef.current = setTimeout(() => {
          lastCalledRef.current = Date.now();
          timeoutRef.current = null;
          setStateValue(slice[key]);
        }, delay - timeDiff);
      }
    };

    if (slice[key] !== stateValue) {
      handler();
    }

    return listenChange(slice, key, handler);
  }, [delay, key, slice, stateValue]);

  return [stateValue, setValue];
}

export default useChangeDebounced;
