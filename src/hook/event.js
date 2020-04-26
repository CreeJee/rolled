const lifeCycleSymbol = "$";
function __generateLifeCycleName(name) {
    return lifeCycleSymbol + name;
}
function __isLifeCycleEvent(name) {
    return name[0] === lifeCycleSymbol;
}
export class EventError extends Error {
    constructor(...args) {
        super(...args);
    }
}
export const EVENT_NAME = {
    unMount: "unMount",
    mount: "mount",
    watch: Symbol("WATCHED_EVENT"),
};
export const SYSTEM_EVENT_NAME = {
    $mount: __generateLifeCycleName("mount"),
    $unMount: __generateLifeCycleName("unMount"),
};
export function expectEvent(context, eventName) {
    if (
        context &&
        typeof context === "object" &&
        context !== null &&
        (eventName in EVENT_NAME || eventName in SYSTEM_EVENT_NAME)
    ) {
        return;
    }
    throw new EventError(`${eventName.toString()} is not supported Event`);
}
export function invokeEvent(hookContext, eventName, { nth = null } = {}) {
    const events = hookContext.events;
    const item = events.get(eventName);
    if (typeof item === "function") {
        return item(hookContext);
    }
    if (Array.isArray(item)) {
        if (Number.isInteger(nth) && nth < item.length) {
            item[nth](hookContext);
        } else {
            for (let index = 0; index < item.length; index++) {
                item[index](hookContext);
            }
        }
    }
    if (!__isLifeCycleEvent(eventName)) {
        const lifeCycleEvent = __generateLifeCycleName(eventName);
        expectEvent(hookContext, lifeCycleEvent);
        invokeEvent(hookContext, lifeCycleEvent);
    }
}
export function boundEvent(context, eventName, value) {
    // if (__isLifeCycleEvent(eventName)) {
    //    throw new EventError(`LifeCycle event is must not binding`)
    // }
    const events = context.events;
    const item = events.get(eventName);
    if (Array.isArray(item)) {
        //TODO: use scheduler task
        if (typeof value === "function") {
            item.push(value);
        } else {
            throw new EventError(`event is must function!!!`);
        }
    } else {
        events.set(eventName, value);
    }
}
export function clearEvent(context, eventName) {
    const events = context.events;
    const item = events.get(eventName);
    if (Array.isArray(item)) {
        item.splice(0);
    } else if (typeof item === "function") {
        events.set(eventName, () => {});
    }
}
export function __createEvent() {
    return {
        events: new Map([
            [EVENT_NAME.mount, []],
            [EVENT_NAME.unMount, []],
            [SYSTEM_EVENT_NAME.$mount, []],
            [SYSTEM_EVENT_NAME.$unMount, []],
            [EVENT_NAME.watch, []],
        ]),
    };
}
export function __getEvent(obj) {
    if (!("events" in obj)) {
        throw new Error("this object is not binding events");
    }
    return obj.events;
}
