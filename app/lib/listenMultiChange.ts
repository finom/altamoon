import { listenChange } from 'use-change';

type Key<SLICE, KEY> = keyof SLICE & string & KEY;

export default function listenMultiChange<SLICE, KEY>(
  givenObject: SLICE, keys: Key<SLICE, KEY>[], handler: () => void | Promise<void>,
): () => void {
  const unlistens = keys.map((key) => listenChange(givenObject, key, () => handler()));

  return () => unlistens.forEach((unlisten) => unlisten());
}
