import {
  useEffect, useRef, EffectCallback, DependencyList,
} from 'react';

export default function useDepsUpdateEffect(effect: EffectCallback, deps: DependencyList): void {
  const wasTriggeredRef = useRef(false);

  return useEffect(() => {
    if (wasTriggeredRef.current) {
      effect();
    }

    wasTriggeredRef.current = true;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
