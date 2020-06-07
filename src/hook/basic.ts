import { __generateChildren, __bindDom, __forceGenerateTags } from "./dom.js";
import {
    HookError,
    LayoutGenError,
    StateObject,
    Context,
    hasHook,
    getHook,
    removeHook,
    bindGlobalHook,
    setHook,
    VirtualBaseComponent,
} from "./core.js";
import { h, Ref } from "../base/index.js";
import { getAnimationQueue, getTimerQueue, getIdleQueue } from "./taskQueue.js";
import {
    invokeEvent,
    EVENT_NAME,
    clearEvent,
    boundEvent,
    SYSTEM_EVENT_NAME,
    __createEvent,
    __getEvent,
} from "../plugins/event.js";
import { __createStore } from "../plugins/store.js";
import reconcile from "../base/reconcile.js";
import reuseNodes from "../base/reuseNodes.js";
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
//d.ts 잠제적 migrate
export * from "./core.js";
export * from "../plugins/event.js";
const noop = () => {};
let __stateTask = getIdleQueue(); //timer queue or state queue
try {
    __stateTask = getIdleQueue();
    __stateTask.add(noop);
} catch (e) {
    __stateTask = getTimerQueue();
}
const layoutTask = getAnimationQueue();
const stateTask = __stateTask;
const __channelMap = new Map();

//effects layout
function __stateLayout(context, initValue, setter) {
    const nth = context.state.length;
    const temp = new StateObject(
        () => context.state[nth],
        function __dispatch(val) {
            if (Array.isArray(context.state)) {
                let value = val instanceof Context ? val.value : val;
                let contextValue = context.state[nth];
                contextValue.value = value;
                if (typeof setter === "function") {
                    setter(contextValue, nth);
                }
            } else {
                throw new Error("dispatch only actived Context");
            }
        }
    );
    if (!(nth in context.state)) {
        context.state[nth] = Context.convert(initValue || undefined, nth);
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
    _taskQueue = stateTask
) {
    return __stateLayout(context, initValue, (contextValue, nth) => {
        _taskQueue.add(() => {
            contextValue.value = _lazySetter(contextValue.value);
            invokeEvent(context, EVENT_NAME.mount, { nth });
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
        context.isMounted = false;
    };
}
function __onMountCycle(context) {
    return () => {
        const $dom = context.$dom;
        for (const $item of $dom) {
            $item.update(context.props);
        }
        context.isMounted = true;
    };
}
function invokeReducer(reducer, state = {}, param = {}) {
    return reducer(state, param);
}
export function combineReducers(reducerObject) {
    const entryKeys = Object.keys(reducerObject);
    return () => {
        const temp = Object.create(null);
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
    if (!Array.isArray(depArray)) {
        throw new HookError("dep is must Array or null");
    }
    const deps = depArray.filter((dep) => dep instanceof Context);
    const event = (context) => {
        const isChange = context.isMounted
            ? // 비교필요
              !depArray.every((el, nth) => el.value === deps[nth])
            : true;
        if (isChange) {
            __cycleEffects(onCycle, (unMount) => {
                typeof unMount === "function" &&
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
//gc에 대해서 해결할 필요가이씀
class ChannelStruct extends Array {
    constructor(context, initValue) {
        super();
        this.ownedContext = context;
        this.state = __stateEffect(context, initValue);
    }
}
export function useChannel(context, channel, initValue = null, onObserve) {
    let channelObj = null;
    if (!__channelMap.has(channel)) {
        const channelObj = new ChannelStruct(context, initValue);
        useEffect(
            context,
            () => {
                const [state] = channelObj.state;
                for (let index = 0; index < channelObj.length; index++) {
                    const handler = channelObj[index];
                    handler(state.value);
                }
                return () => {};
            },
            [channelObj.state[0]]
        );
        __channelMap.set(channel, channelObj);
    }
    channelObj = __channelMap.get(channel);
    if (typeof onObserve === "function") {
        channelObj.push(onObserve);
    }
    // state는 특정 context에 종속되어 만들때 사용된 context가 아니면 사용및 effect를 발생시키지 못한다
    // 아이러니한건 이 동작이 마치 UB마냥 행해질것같은대 이거에 대한 생각을 해봐야함
    return channelObj.state;
}
//generic dom util
export function reactiveMount(context, refName, componentTree) {
    if (context.$self === null) {
        throw new LayoutGenError("current context is not mounted dom");
    }
    const refs = context.$self.collect();
    refName = refName.toLowerCase();
    if (!(refName in refs)) {
        throw new LayoutGenError(`Ref "${refName}" must contains component`);
    }
    if (!Array.isArray(componentTree)) {
        throw new LayoutGenError(`ComponentTree is must Array`);
    }
    const refTag = refs[refName];
    return reactiveTagMount(refTag, componentTree, reconcile);
}
export function reactiveTagMount(refTag, componentTree, renderer = reuseNodes) {
    if (
        !(
            refTag instanceof HTMLElement ||
            refTag instanceof VirtualBaseComponent
        )
    ) {
        throw new LayoutGenError(`refTag must HTMLElement`);
    }
    const reactiveSymbol = Symbol.for(`@@reactiveMountedTag`);
    if (!Array.isArray(refTag[reactiveSymbol])) {
        Object.defineProperty(refTag, reactiveSymbol, {
            writable: false,
            enumerable: false,
            configurable: false,
            value: [],
        });
    }
    const renderedItems = refTag[reactiveSymbol];
    try {
        //do not force mount
        //todo: optimize
        const rendererItems = __forceGenerateTags(
            refTag,
            renderedItems,
            componentTree,
            [],
            renderer
        );
        renderedItems.splice(0, renderedItems.length, ...rendererItems);
        // debugger;
    } catch (e) {
        if (e instanceof LayoutGenError) {
            throw new LayoutGenError(`[ReactiveMount] ${e.message}`);
        } else {
            throw e;
        }
    }
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
function __defaultLazy() {
    //TODO: generate component
    return h`<div style="display:none;"></div>`;
}
export function lazy(load, loading = __defaultLazy) {
    return new LazyComponent(Promise.resolve(load()), loading);
}
//bound hooks
export function bindHook(props = {}, children) {
    const eventData = __createEvent();
    const hookContext = {
        state: [],
        props,
        parent: null,
        children,
        isMemo: false,
        isMounted: false,
        $dom: [],
        $children: [],
        ...__createStore(), /// search from context tree store value
        $self: null,
        $slot: null,
        ...eventData,
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
        useChannel(channel, initValue, onObserve) {
            return useChannel(hookContext, channel, initValue, onObserve);
        },
        reactiveMount(refName, componentTree) {
            return reactiveMount(hookContext, refName, componentTree);
        },
    };
    const events = __getEvent(hookContext);
    events.get(SYSTEM_EVENT_NAME.$mount).push(__onMountCycle(hookContext));
    events.get(SYSTEM_EVENT_NAME.$unMount).push(__unMountCycle(hookContext));
    return Object.assign(hookContext, bindGlobalHook(hookContext));
}
export function __createComponent(component, tagProps, hookContext) {
    const componentNode =
        component instanceof LazyComponent ? component.loading : component;
    return componentNode(tagProps, hookContext);
}
function __compileComponent(component, tagProps, hookContext, children) {
    const current = __createComponent(component, tagProps, hookContext);
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
                    if (slot.hasChildNodes()) {
                        throw new LayoutGenError(
                            "fragemnt-layout-generate is yet supported"
                        );
                    }
                    break;
                case Node.ELEMENT_NODE:
                    break;
                default:
                    slot = current;
                    break;
            }
            hookContext.$slot = slot;
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
    return (_item) => {
        const tagProps = { ...props };
        const hookContext = bindHook(tagProps, children);
        const current = __compileComponent(
            component,
            tagProps,
            hookContext,
            children
        );
        setHook(current, hookContext);
        return current;
    };
};
