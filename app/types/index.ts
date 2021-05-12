// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TodoAny = any;
export type NotNull<T> = T extends null | undefined ? never : T;
