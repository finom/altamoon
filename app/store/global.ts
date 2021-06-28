import { RootStore } from '.';

declare global {
  // this global type is created to avoid circular references at store branches
  // (Market, PersistentStore etc) to make them use RootStore safely
  type Store = RootStore;
}
