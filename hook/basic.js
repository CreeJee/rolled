const generateMemoryKey = () => Object.create(null);
class HookValue {
    constructor(value, nth) {
        this.value = value;
        this.nth = nth;
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
        return new HookValue(value, nth);
    }
}
const hookSymbol = Symbol("@@Hook");
const EVENT_NAME = {
    unMount: "unMount",
    mount: "mount",
    watch: Symbol("WATCHED_EVENT")
};
export function isHooked(component) {
    return hookSymbol in component;
}
export function getHook(component) {
    return component[hookSymbol];
}
function setHook(component, hook) {
    return (component[hookSymbol] = hook);
}
function expectEvent(context, eventName) {
    if (
        context &&
        typeof context === "object" &&
        context !== null &&
        eventName in EVENT_NAME
    ) {
        return;
    }

    throw new Error(`${eventName} is not supported Event`);
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
export function useState(context, initValue) {
    const temp = [null, null];
    const state = context.state;
    const nth = state.length;
    if (!state[nth]) {
        state[nth] = HookValue.convert(initValue || undefined, nth);
    }
    Object.defineProperties(temp, {
        0: {
            get: () => state[nth]
        },
        1: {
            get: () =>
                function setter(val) {
                    state[nth].value =
                        val instanceof HookValue ? val.value : val;
                    //batching ang merge
                    //그럴시 타이머? 혹은 다른거?
                    // invokeEvent(context, EVENT_NAME.mount);
                }
        }
    });
    return temp;
}
export function useEffect(context, onCycle, depArray = null) {
    const deps = depArray.map((v, k) =>
        context.state.find(({ value }) => value === v)
    );
    if (!Array.isArray(depArray) && depArray !== null) {
        throw new Error("dep is must Array or null");
    }
    const event = (context) => {
        const isChange =
            deps.length > 0 && depArray
                ? !depArray.every((el, nth) => el === deps[nth])
                : true;
        if (isChange) {
            // context.state = [...depArray];
            const unMount = onCycle();
            const $dom = context.$dom;
            //is depArray is difference
            if (typeof unMount === "function") {
                boundEvent(context, EVENT_NAME.unMount, (context) => {
                    unMount(context);
                    //소멸사이클
                    for (const k of Object.values(EVENT_NAME)) {
                        clearEvent(context, k);
                    }
                    context.$dom.splice(0);
                });
            }
        }
    };
    boundEvent(context, EVENT_NAME.mount, event);
}
export function bindHook(render, props = {}) {
    const hookContext = {
        state: [],
        $dom: null,
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
        }
    };
    return hookContext;
}
export const c = (component, props, children) => {
    const hoc = (item) => {
        const tagProps = { ...props, ...item, children };
        const hookContext = bindHook(component, tagProps);
        const current = component(tagProps, hookContext);
        hookContext.$dom =
            current.nodeType === Node.DOCUMENT_FRAGMENT_NODE
                ? Array.from(current.childNodes)
                : [current];
        setHook(current, hookContext);
        return current;
    };
    return hoc;
};
