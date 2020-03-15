import { __generateChildren } from "./dom.js";
import { getAnimationQueue, getTimerQueue, getIdleQueue } from "./taskQueue.js";

const generateMemoryKey = () => Object.create(null);
const globalEnvironments = {
    stateTask: getIdleQueue(),
    layoutTask: getAnimationQueue(),
    hooksMiddleWare: []
};
const __Context_Getter = (target, prop, receiver) => {
    const pureValue = target.value;
    return Reflect.get(
        typeof pureValue === "object" && prop in pureValue
            ? target.value
            : target,
        prop,
        receiver
    );
};
class Context {
    constructor(value, nth) {
        this.value = value;
        this.nth = nth;
        return new Proxy(this, {
            get: __Context_Getter
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
class StateObject {
    constructor(getter, dispatcher) {
        Object.defineProperties(this, {
            0: {
                get: getter
            },
            1: {
                get: () => dispatcher
            }
        });
    }
    *[Symbol.iterator]() {
        yield this[0];
        yield this[1];
    }
}
class HookError extends Error {
    constructor(...args) {
        super(...args);
    }
}
const hookSymbol = Symbol("@@Hook");
export function isHooked(component) {
    return hookSymbol in component;
}
export function getHook(component) {
    return component[hookSymbol];
}
function setHook(component, hook) {
    return (component[hookSymbol] = hook);
}
export function useGlobalHook(hook) {
    if (typeof hook !== "function") {
        throw new HookError("custom hook middleware is must function");
    }
    globalEnvironments.hooksMiddleWare.push(hook);
}
function bindGlobalHook(hook) {
    return globalEnvironments.hooksMiddleWare.reduce((accr, handler) => {
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
//event
const EVENT_NAME = {
    unMount: "unMount",
    mount: "mount",
    watch: Symbol("WATCHED_EVENT")
};
function expectEvent(context, eventName) {
    if (
        context &&
        typeof context === "object" &&
        context !== null &&
        eventName in EVENT_NAME
    ) {
        return;
    }
    throw new HookError(`${eventName.toString()} is not supported Event`);
}
export function invokeEvent(hookContext, eventName) {
    expectEvent(hookContext, eventName);
    const item = hookContext.events[eventName];
    if (typeof item === "function") {
        return item(hookContext);
    }
    if (Array.isArray(item)) {
        for (let index = 0; index < item.length; index++) {
            item[index](hookContext);
        }
    }
}
function boundEvent(context, eventName, value) {
    expectEvent(context, eventName);
    const events = context.events;
    const item = events[eventName];
    if (Array.isArray(item)) {
        item.push(value);
    } else {
        events[eventName] = value;
    }
}
function clearEvent(context, eventName) {
    expectEvent(context, eventName);
    const events = context.events;
    const item = events[eventName];
    if (Array.isArray(item)) {
        item.splice(0);
    } else {
        events[eventName] = () => {};
    }
}

function __stateLayout(context, initValue, setter) {
    const state = context.state;
    const nth = state.length;
    const temp = new StateObject(
        () => state[nth],
        function __dispatch(val) {
            let value = val instanceof Context ? val.value : val;
            let contextValue = state[nth];
            contextValue.value = value;
            if (typeof setter === "function") {
                //is it really nessary setter?
                setter(contextValue);
            }
        }
    );
    if (!state[nth]) {
        state[nth] = Context.convert(initValue || undefined, nth);
    }
    return temp;
}
//TODO : lazy initValue (typeof initValue === 'function')
function _lazySetter__useEffect(value) {
    return value;
}
function __stateEffect(
    context,
    initValue,
    _lazySetter = typeof initValue === "function"
        ? initValue
        : _lazySetter__useEffect,
    _tasQueue = globalEnvironments.stateTask
) {
    return __stateLayout(context, initValue, (contextValue) => {
        _tasQueue.add(() => {
            contextValue.value = _lazySetter(contextValue.value);
            invokeEvent(context, EVENT_NAME.mount);
            // invokeEvent(context, EVENT_NAME.watch);
        });
        // console.log("settedEnvironments", context);
        return contextValue;
    });
}
export function useState(context, initValue, _lazySetter) {
    const state = __stateEffect(context, initValue, _lazySetter);
    const __dispatch = state[1];
    __dispatch(initValue);
    return state;
}
function __cycleEffects(cycle, nextCycle) {
    return typeof cycle === "function" ? cycle(nextCycle) : nextCycle();
}
function __unMountCycle(context) {
    return () => {
        for (const k of Object.values(EVENT_NAME)) {
            clearEvent(context, k);
        }
        // context.$dom.splice(0);
    };
}
function __onMountCycle(context) {
    return (unMount) => {
        const $dom = context.$dom;
        for (const $item of $dom) {
            $item.update(context.props.item);
        }
        boundEvent(context, EVENT_NAME.unMount, (context) => {
            __cycleEffects(unMount, __unMountCycle(context));
        });
    };
}

export function useEffect(context, onCycle, depArray = null) {
    const deps = depArray.map((v, k) =>
        context.state.find(({ value }) => value === v)
    );
    if (!Array.isArray(depArray) && depArray !== null) {
        throw new HookError("dep is must Array or null");
    }
    const event = (context) => {
        const isChange =
            deps.length > 0 && depArray
                ? // 비교필요
                  !depArray.every((el, nth) => el === deps[nth])
                : true;
        if (isChange) {
            __cycleEffects(onCycle, __onMountCycle(context));
        }
    };
    boundEvent(context, EVENT_NAME.mount, event);
}
//it will be removed...?
export function useContext(value) {
    return Context.convert(value);
}

function invokeReducer(reducer, state = {}, param = {}) {
    return reducer(state, param);
}
export function useReducer(context, reducer, initState, init) {
    const baseState = typeof init === "function" ? init(initState) : initState;
    const contextedState = __stateEffect(context, baseState);
    const [currentState, __dispatch] = contextedState;
    const dispatcher = (param) => {
        const result = invokeReducer(reducer, currentState, param);
        __dispatch(result);
    };
    return new StateObject(() => currentState, dispatcher);
}

export function combineReducers(reducerObject) {
    const entryKeys = Object.keys(reducerObject);
    return () => {
        const temp = {};
        for (let index = 0; index < entryKeys.length; index++) {
            const key = entryKeys[index];
            temp[key] = invokeReducer(reducerObject[key]);
        }
        return temp;
    };
}
export function bindHook(render, props = {}) {
    const hookContext = {
        state: [],
        props,
        $dom: [],
        render() {
            return render();
        },
        events: {
            [EVENT_NAME.mount]: (context) => {},
            [EVENT_NAME.unMount]: (context) => {},
            [EVENT_NAME.watch]: []
        },
        useState(value) {
            return useState(hookContext, value);
        },
        useEffect(...arg) {
            return useEffect(hookContext, ...arg);
        },
        useReducer(...arg) {
            return useReducer(hookContext, ...arg);
        },
        //전역으로서 봐야할지
        //middleware로서 전체바인딩을 해야할지 난제이다

        useHook(fn) {
            return Object.assign(bindHook, fn(hookContext));
        }
    };
    return { ...bindGlobalHook(hookContext), ...hookContext };
}
export const c = (component, props, children) => {
    const hoc = (item) => {
        const tagProps = { ...props, item };
        const hookContext = bindHook(component, tagProps);
        const current = component(tagProps, hookContext);

        if (!(current instanceof Node)) {
            throw new HookError("render function is must node");
        }
        if (current.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
            hookContext.$dom = Array.from(current.childNodes);
            if (Array.isArray(children) && children.length > 0) {
                throw new HookError("fragment-child is not support");
            }
        } else {
            hookContext.$dom = [current];
            __generateChildren(current, children);
        }
        setHook(current, hookContext);
        return current;
    };
    return hoc;
};
