import { __keyableTypes, HookContext } from "./basic";

export function __createStore(): {
    $store: Map<__keyableTypes, any>;
};
export function fromStore<T>(
    context: HookContext,
    key: __keyableTypes,
    defaultValue: T
): T;
export function setStore<T>(
    context: HookContext,
    key: __keyableTypes,
    value: T
): T;
