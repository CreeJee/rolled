export const hooksMiddleWare = [];
const __Context_Getter = (target, prop) => {
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
const __Context_Apply = (target, thisArg, argumentsList) =>
    Reflect.apply(target, thisArg, argumentsList);
export class Context {
    constructor(value, nth) {
        this.value = value;
        this.nth = nth;
        return new Proxy(this, {
            get: __Context_Getter,
            apply: __Context_Apply,
        });
    }
    toString() {
        return this.value.toString();
    }
    valueOf() {
        return this.value;
    }
    [Symbol.toPrimitive]() {
        return this.value;
    }
    static convert(value, nth) {
        return new Context(value, nth);
    }
}
export class StateObject {
    constructor(getter, dispatcher) {
        Object.defineProperties(this, {
            0: {
                get: getter,
            },
            1: {
                get: () => dispatcher,
            },
            length: {
                value: 2,
            },
        });
    }
    *[Symbol.iterator]() {
        yield this[0];
        yield this[1];
    }
}

// Errors
export class LayoutGenError extends Error {
    constructor(msg) {
        super(msg);
    }
}

export class HookError extends Error {
    constructor(...args) {
        super(...args);
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
