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
export function invokeEvent(hookContext, eventName) {
    expectEvent(hookContext, eventName);
    const events = hookContext.events;
    const item = events[eventName];
    if (typeof item === "function") {
        return item(hookContext);
    }
    if (Array.isArray(item)) {
        for (let index = 0; index < item.length; index++) {
            item[index](hookContext);
        }
    }
    if (!__isLifeCycleEvent(eventName)) {
        invokeEvent(hookContext, lifeCycleSymbol + eventName);
    }
}
export function boundEvent(context, eventName, value) {
    expectEvent(context, eventName);
    const events = context.events;
    const item = events[eventName];
    if (Array.isArray(item)) {
        //TODO: use scheduler task
        if (typeof value === "function") {
            item.push(value);
        } else {
            throw new EventError(`event is must function!!!`);
        }
    } else {
        events[eventName] = value;
    }
}
export function clearEvent(context, eventName) {
    expectEvent(context, eventName);
    const events = context.events;
    const item = events[eventName];
    if (Array.isArray(item)) {
        item.splice(0);
    } else {
        events[eventName] = () => {};
    }
}
