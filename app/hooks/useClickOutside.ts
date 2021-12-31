import { MutableRefObject, useEffect } from 'react';

export default function useClickOutside(
  ref: MutableRefObject<Element | undefined | null>,
  callback: () => void,
) {
  useEffect(() => {
    const handler = ({ target }: MouseEvent) => {
      if (!ref.current?.contains(target as Node)) {
        callback();
      }
    };

    document.addEventListener('click', handler);

    return () => document.removeEventListener('click', handler);
  });
}
