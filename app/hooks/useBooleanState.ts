/*
  Usage:
  const [value, setTrue, setFalse] = useBooleanState(initialValue);
*/

import { useState, useCallback } from 'react';

export default function useBooleanState(
  initialValue: boolean,
): [boolean, () => void, () => void, () => void] {
  const [value, onSetValue] = useState<boolean>(initialValue);
  const onSetTrue = useCallback(() => onSetValue(true), []);
  const onSetFalse = useCallback(() => onSetValue(false), []);
  const onToggle = useCallback(() => onSetValue(!value), [value]);

  return [value, onSetTrue, onSetFalse, onToggle];
}
