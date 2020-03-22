import {
    __generateChildren,
    LayoutGenError,
    __generateComponent,
    __bindDom
} from "./dom.js";
import {
    HookError,
    StateObject,
    Context,
    hasHook,
    getHook,
    removeHook,
    bindGlobalHook,
    setHook
} from "./core.js";
import { h } from "../index.js";
import { getAnimationQueue, getTimerQueue, getIdleQueue } from "./taskQueue.js";
import { invokeEvent, EVENT_NAME, clearEvent, boundEvent } from "./event.js";

//d.ts 잠제적 migrate
export * from "./core.js";
export * from "./event.js";
const stateTask = getIdleQueue();
const layoutTask = getAnimationQueue();
const __channelMap = new Map();

//effects layout
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
function _lazySetter__useEffect(value) {
    return value;
}
function __stateEffect(
    context,
    initValue,
    _lazySetter = typeof initValue === "function"
        ? initValue
        : _lazySetter__useEffect,
    _tasQueue = stateTask
) {
    return __stateLayout(context, initValue, (contextValue) => {
        _tasQueue.add(() => {
            contextValue.value = _lazySetter(contextValue.value);
            invokeEvent(context, EVENT_NAME.mount);
        });
        return contextValue;
    });
}
//cycle
function __cycleEffects(cycle, nextCycle) {
    let cycleResult = null;
    if (typeof cycle === "function") {
        cycleResult = cycle(nextCycle);
    }
    if (typeof nextCycle === "function") {
        nextCycle(cycleResult);
    }
}
function __unMountCycle(context) {
    return () => {
        /**
         * 우선 생각을 해볼것이 unMount행위등에따르는것이
         *
         * memo에 축적되었을때 다시마운트하느냐
         * memo 에 한정해서 unMount 없이 캐싱하느냐
         *
         * 이고 우선적으로 떠오르는건 1번일지도
         *
         * 하자만 1일경우 child를 unMount시킬경우 unMount 시키고 mount시키는것자체가 큰 의미가없게됨
         *
         * 사실 엄밀히보면 dom차원의 업데이트이기에 xhr이나 비싼연산아니면 의미가없는데
         * 2를 하자니 존나더러워질것가틈
         *
         *
         */
        if (!context.isMemo) {
            for (const k of Object.keys(EVENT_NAME)) {
                clearEvent(context, k);
            }
            context.state.splice(0);
            for (const child of context.$children.splice(0)) {
                if (hasHook(child)) {
                    invokeEvent(getHook(child), EVENT_NAME.unMount);
                }
            }
            removeHook(context.$self);
            for (const k in context) {
                delete context[k];
            }
        }
    };
}
function __onMountCycle(context) {
    return () => {
        const $dom = context.$dom;
        for (const $item of $dom) {
            $item.update(context.props);
        }
    };
}
function invokeReducer(reducer, state = {}, param = {}) {
    return reducer(state, param);
}
//hook utils
export function memo(component, memorizedSymbol = Symbol.for("@@Memo")) {
    if (typeof component !== "function") {
        throw new Error(`memorized component should be function`);
    }
    // TODO: use Map
    if (typeof component[memorizedSymbol] !== "object") {
        component[memorizedSymbol] = new Map();
    }
    return (...arg) => {
        const memo = component[memorizedSymbol];
        // 재대로된 serialize방식을 가질것
        const key = JSON.stringify(arg);
        if (memo.has(key)) {
            return memo.get(key);
        } else {
            const value = component(...arg);
            if (hasHook(value)) {
                getHook(value).isMemo = true;
            }
            memo.set(key, value);
            return value;
        }
    };
}
export class LazyComponent {
    constructor(load, loadingComponent) {
        load.then((LoadedComponent) => {
            const $parent = this.current.parentNode;
            const isHook = hasHook(this.current);
            const hook = isHook ? getHook(this.current) : null;
            let current = isHook
                ? __moveHook(hook, LoadedComponent)
                : LoadedComponent(...this.props);
            $parent.insertBefore(current, this.current);
            this.current.remove();
            this.current = current;
        });
        if (typeof loadingComponent !== "function") {
            throw new LayoutGenError("loading component must function");
        }
        this.loading = (...args) => {
            this.props = args;
            return (this.current = loadingComponent(...args));
        };
    }
}
function __defaultLazy() {
    //TODO: generate component
    return h`<empty></empty>`;
}
export function lazy(load, loading = __defaultLazy) {
    return new LazyComponent(Promise.resolve(load()), loading);
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
// hooks
export function useState(context, initValue, _lazySetter) {
    const state = __stateEffect(context, initValue, _lazySetter);
    const __dispatch = state[1];
    __dispatch(initValue);
    return state;
}
export function useLayoutState(context, initValue, _lazySetter) {
    const state = __stateEffect(context, initValue, _lazySetter, layoutTask);
    const __dispatch = state[1];
    __dispatch(initValue);
    return state;
}
export function useEffect(context, onCycle, depArray = []) {
    const deps = depArray.filter((dep) => dep instanceof Context);
    if (!Array.isArray(depArray)) {
        throw new HookError("dep is must Array or null");
    }
    const event = (context) => {
        const isChange =
            deps.length > 0 && depArray
                ? // 비교필요
                  !depArray.every((el, nth) => el.value === deps[nth])
                : true;
        if (isChange) {
            __cycleEffects(onCycle, (unMount) => {
                boundEvent(context, EVENT_NAME.unMount, unMount);
            });
        }
    };
    boundEvent(context, EVENT_NAME.mount, event);
}
export function useContext(value) {
    return Context.convert(value);
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
// export function useMemo(context, onCycle, deps) {}

// channel might be string|symbol
//gc에 대해서 해결할 필요가이씀
class ChannelStruct extends Array {
    constructor(context, initValue) {
        super(context);
        this.state = useState(initValue);
    }
}
export function useChannel(context, channel, onObserve, __initValue = null) {
    let channelObj = null;
    if (!__channelMap.has(channel)) {
        const channelObj = new ChannelStruct(context, __initValue);
        const [state] = channelObj.state;
        useEffect(
            context,
            () => {
                for (let index = 0; index < channelObj.length; index++) {
                    const handler = channelObj[index];
                    handler(state);
                }
            },
            [state]
        );
        __channelMap.set(channel, channelObj);
    }
    channelObj = __channelMap.get(channel);
    channelObj.push(onObserve);
    return channelObj.state;
}
//bound hooks
export function bindHook(props = {}, children) {
    const hookContext = {
        state: [],
        props,
        children,
        $dom: [],
        $children: [],
        $self: null,
        isMemo: false,
        events: {
            [EVENT_NAME.mount]: [],
            [EVENT_NAME.unMount]: [],
            [EVENT_NAME.$mount]: [],
            [EVENT_NAME.$unMount]: [],
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
        useHook(fn) {
            return Object.assign(hookContext, fn(hookContext));
        },
        useChannel(channel, onObserve, __initValue) {
            return useChannel(hookContext, channel, onObserve, __initValue);
        }
    };
    const events = hookContext.events;
    events[EVENT_NAME.$mount].push(__onMountCycle(hookContext));
    events[EVENT_NAME.$unMount].push(__unMountCycle(hookContext));
    return Object.assign(hookContext, bindGlobalHook(hookContext));
}
export function __compileComponent(component, tagProps, hookContext, children) {
    const current = component(tagProps, hookContext);
    const needChild = Array.isArray(children);
    if (!(current instanceof Node)) {
        throw new HookError("render function is must node");
    }
    if (current.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
        hookContext.$dom = Array.from(current.childNodes);
        if (needChild && children.length > 0) {
            throw new HookError("fragment-child is not support");
        }
    } else {
        hookContext.$dom = [current];
        if (needChild) {
            let slot = current.collect().children;
            switch (
                typeof slot === "object" && "nodeType" in slot
                    ? slot.nodeType
                    : -Infinity
            ) {
                case Node.TEXT_NODE:
                    let parent = slot.parentElement;
                    slot.remove();
                    slot = parent;
                    break;
                case Node.ELEMENT_NODE:
                    break;
                default:
                    slot = current;
                    break;
            }
            hookContext.$children = __generateChildren(slot, children);
        }
    }
    return current;
}

function __moveHook(oldHook, component) {
    const generated = __bindDom(
        { ...oldHook.props },
        c(component, oldHook.props, oldHook.children)()
    );
    return generated;
}
export const c = (component, props = {}, children) => {
    const hoc = (item) => {
        const tagProps = { ...props };
        const hookContext = bindHook(tagProps, children);
        const current = __compileComponent(
            component instanceof LazyComponent ? component.loading : component,
            tagProps,
            hookContext,
            children
        );
        setHook(current, hookContext);
        return current;
    };
    return hoc;
};
