export default function getPersistentStorageValue<T, K extends string>(key: K, defaultValue: T): T {
  const storageValue = localStorage.getItem(key);
  return storageValue ? JSON.parse(storageValue) as T : defaultValue;
}
