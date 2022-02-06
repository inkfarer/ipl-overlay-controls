export type Module = {[key: string]: (...args: unknown[]) => unknown};
export type UnknownModule = {[key: string]: unknown};
export type UnknownFunction = (...args: unknown[]) => unknown;
