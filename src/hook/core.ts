import { toString, valueOf, Transform } from "../util";
type ContextValue<T> = T & Transform<T, "toString"> & Transform<T, "valueOf">;
type Dispatcher<T> = (value: T) => void;
type Getter<T> = () => T;

interface IContext<T, Value extends ContextValue<T> = ContextValue<T>> {
    value: Value;
    nth: number;

    toString(): string;
    valueOf(): T;
    [Symbol.toPrimitive](): T;
}

const hooksMiddleWare = [];
const __Context_Getter = <T>(target: IContext<T>, prop: string) => {
    const pureValue = target.value;
    return Reflect.get(
        prop in target
            ? target
            : typeof pureValue === "object" && prop in pureValue
            ? target.value
            : target,
        prop
    );
};
export class Context<T> implements IContext<T> {
    value: ContextValue<T>;
    nth: number;
    constructor(value: ContextValue<T>, nth: number) {
        this.value = value;
        this.nth = nth;
        return new Proxy(this, {
            get: __Context_Getter,
        });
    }
    toString() {
        return toString(this.value);
    }
    valueOf() {
        return valueOf(this.value);
    }
    [Symbol.toPrimitive]() {
        return valueOf(this.value);
    }
    static convert<T>(value: ContextValue<T>, nth = 0) {
        return new Context(value, nth);
    }
}
export class StateObject<T> {
    #contextGetter: Getter<Context<T>>;
    #contextDispatcher: Dispatcher<T>;
    get [0]() {
        return this.#contextGetter();
    }
    get [1]() {
        return this.#contextDispatcher;
    }
    constructor(getter: Getter<Context<T>>, dispatcher: Dispatcher<T>) {
        this.#contextGetter = getter;
        this.#contextDispatcher = dispatcher;
    }
    *[Symbol.iterator]() {
        yield this[0];
        yield this[1];
    }
}
export class VirtualBaseComponent<PropTypes> {
    //impl
    onUpdate(_data: PropTypes) {
        throw new LayoutGenError("need [VirtualLayout.update]");
    }
    onRemove() {
        throw new LayoutGenError("need [VirtualLayout.remove]");
    }
    isUpdate(current: PropTypes, before: PropTypes) {
        return true;
    }
    // mock prototype extends chain
    get nodeType() {
        return VirtualBaseComponent.nodeType;
    }
    static get nodeType() {
        return "VirtualComponent";
    }
}

// Errors
export class LayoutGenError extends Error {
    constructor(msg: string) {
        super(msg);
    }
}
export class HookError extends Error {
    constructor(msg: string) {
        super(msg);
    }
}
//hook
export const hookSymbol = Symbol("@@Hook");
export function hasHook(component) {
    return hookSymbol in component;
}
export function getHook(component) {
    return component[hookSymbol];
}
export function setHook(component, hook) {
    hook.$self = component;
    return (component[hookSymbol] = hook);
}
export function removeHook(component) {
    let hook = component[hookSymbol];
    delete hook.$self;
    delete component[hookSymbol];
    hook = null;
}
export function useGlobalHook(hook) {
    if (typeof hook !== "function") {
        throw new HookError("custom hook middleware is must function");
    }
    hooksMiddleWare.push(hook);
}
export function bindGlobalHook(hook) {
    return hooksMiddleWare.reduce((accr, handler) => {
        const initResult = handler(hook) || {};
        const handlers = Object.values(initResult);
        if (
            typeof initResult === "object" &&
            handlers.every((v) => typeof v === "function")
        ) {
            Object.assign(accr, initResult);
        } else {
            throw new HookError(
                "custom hook middleware result is must object & each element is must function"
            );
        }
        return accr;
    }, {});
}
