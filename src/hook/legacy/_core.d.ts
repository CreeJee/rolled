export type __keyableTypes = string | symbol;
export type __keyableObjects<T> = {
    [key in __keyableTypes]: T;
};
export type __lazySetter<T> = () => T;
export type __lazyValue<T> = T | __lazySetter<T>;
export type Dispatcher<T> = (p: T) => void;

export const hookSymbol: unique symbol;
export type HookBase<T> = {
    $self: T;
};
export type HookedComponent<
    Self,
    HookObject extends HookBase<Self> = HookBase<Self>
> = {
    [hookSymbol]: HookObject & HookBase<Self>;
};
export type StateObject<T, Data = T> = [Context<T>, Dispatcher<Data>];
export class Context<T> {
    constructor(value: any, nth: number);
    toString(): string;
    valueOf(): T;
    value: T;
    [Symbol.toPrimitive](): T;
    static convert<T>(value: any, nth: number): Context<T>;
}
export class VirtualBaseComponent<PropTypes> {
    //impl
    onUpdate(data: PropTypes): never | void;
    onRemove(): never | void;
    isUpdate(current: PropTypes, old: PropTypes): boolean;
    // mock prototype extends chain
    get nodeType(): string;
    static get nodeType(): string;
}
export type HookResolver<PropTypes, ReturnType = any, HookType = {}> = (
    hook: HookType & HookBase<PropTypes>
) => __keyableObjects<ReturnType>;
export type GlobalHookResolver<PropTypes> = {
    [index: string]: HookResolver<PropTypes>;
};
export class LayoutGenError extends Error {}
export class HookError extends Error {}

export function hasHook<Self>(component: HookedComponent<Self>): Boolean;
export function getHook<Self>(component: HookedComponent<Self>): T;
export function setHook<Self, Q>(
    component: HookedComponent<Self, Q & HookBase<Self>>,
    hook: Q & HookBase<Self>
): Q & HookBase<Self>;
export function removeHook<T>(component: HookedComponent<T>): T;
export function useGlobalHook(hook: HookResolver<any>): void;
export function bindGlobalHook(hook);
