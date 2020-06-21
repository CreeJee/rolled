import { ComponentPlugin, IBaseComponent, InferComponent, Component} from "../hook/component";
import { IStore } from "../util";
type SYSTEM_EVENT = "$mount" | "$unMount";
type CONSTANT_EVENT = "mount" | "unMount";

type EventHandler<T> = (self: T) => void;

type AbstractStore<T,K extends string = string> = {
    [k in K]: EventHandler<T>[]
}
type BaseStore<T> = AbstractStore<T,(SYSTEM_EVENT | CONSTANT_EVENT)>;
type EventPipedMap<Extra,Component> = {
    events: IStore<
        (
            Extra extends string ?
                AbstractStore<Component,Extra>:
                BaseStore<Component>
        ) &
        BaseStore<Component>
    >
};
type EventComponent<
    Extra,
    Component = IBaseComponent
> = ComponentPlugin<EventPipedMap<Extra,Component>,Component>;


const lifeCycleSymbol = "$";
function __generateLifeCycleName(name: string) {
    return lifeCycleSymbol + name;
}
function __isLifeCycleEvent(name: string) {
    return name[0] === lifeCycleSymbol;
}
export class EventError extends Error {
    constructor(msg: string) {
        super(msg);
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
//nth component infer
export function invokeEvent<
    Component,
    EventName extends string
>(
    hookContext: EventComponent<EventName,Component>, 
    eventName: EventName, { nth = -1 } = {}
) {
    const a = hookContext;
    const events = hookContext.events;
    const item = events.get(eventName);
    
    if (Number.isInteger(nth) && nth < -1 && nth < item.length) {
        item[nth](hookContext);
        const o = item[nth];
    } else {
        for (let index = 0; index < item.length; index++) {
            item[index](hookContext);
        }
    }
    if (!__isLifeCycleEvent(eventName)) {
        const lifeCycleEvent = __generateLifeCycleName(eventName);
        invokeEvent<Component,typeof lifeCycleEvent>(hookContext, lifeCycleEvent);
    }
}
export function boundEvent<
    Component,
    EventName extends string
>(
    context: EventComponent<EventName,Component>,
    eventName: EventName, value:EventHandler<Component>
) {
    if (__isLifeCycleEvent(eventName)) {
       throw new EventError(`LifeCycle event is must not binding`)
    }
    context.events.get(eventName).push(value);
}
export function clearEvent<
    Component,
    EventName extends string
>(context:EventComponent<EventName,Component>, eventName:EventName) {
    context.events.get(eventName).splice(0);
}
