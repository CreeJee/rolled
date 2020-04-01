import { BaseLiteralElement } from "../index";

declare const HOOK_SYMBOL:  unique symbol;
type Dispatcher<T> = (p: T) => void
/**
 * @description state interface class
 */
export class StateObject<T, Dispatch extends Dispatcher<T> = Dispatcher<T>> {
    get [0](): Context<T>;
    get [1](): Dispatch;
    [Symbol.iterator](): [Context<T>, Dispatch]
}
export class Context<T> {
    constructor(value: any, nth: number)
    toString(): string
    valueOf(): T
    [Symbol.toPrimitive](): T
    static convert<T>(value: any, nth: number): Context<T>
}
export class ChannelStruct<T> extends Array<HookContext> {
    state: StateObject<T>
}
export class LazyComponent<PropTypes>{
    constructor(load: ()=> Promise<RendererType<PropTypes>>, loadingComponent: ()=> RendererType<PropTypes>)
}
type IHookResponse<T, Dispatch extends Dispatcher<T> = Dispatcher<T>> = StateObject<T, Dispatch>
type StateResponse<T> = IHookResponse<T, (newState: T) => void>;
type ReducerResponse<T> = IHookResponse<T, (action: Object) => void>;
type ReducerInit<T, Action> = (state: T, action: Action) => T
type __keyableTypes = (string | symbol);
type __keyableObjects<T> = {
    [key in __keyableTypes]: T
}
type __lazySetter<T> = () => T;
type __lazyValue<T> = T | __lazySetter<T>;
//TODO return type should generic
type HookResolver<PropTypes, ReturnType = any> = (hook: HookContext<PropTypes>) => __keyableObjects<ReturnType>;
type ReducerObject<State, Action extends object> = __keyableObjects<ReducerInit<State, Action>>;

export function useState<T>(context: Context<T>, initialValue: __lazyValue<T>): StateResponse<T>;
export function useEffect<T>(context: Context<T>, effect: Function, inputs?: Array<Context<any>>): void;
export function useContext<T>(value: T): Context<T>;
export function useReducer<T, Action = Object>(
    reducer: ReducerInit<T, Action>,
    initialState: T,
    initialAction?: Action,
): ReducerResponse<T>;
export function useChannel<T,Data>(context:Context<T>,channel: __keyableTypes, __initValue:Data, onObserve: (state: Context<Data>) => void): ChannelStruct<Data>
export function reactiveMount<T,Data>(context:Context<T>,refName: __keyableTypes, componentTree: hookedType<Data, BaseLiteralElement>[]): void;
export function memo<T>(handler: ()=> T): () => T 
export function lazy<PropTypes>(
    load: ()=> Promise<RendererType<PropTypes>>,
    loading?: ()=> RendererType<PropTypes>
): LazyComponent<PropTypes>
export type HookContext<PropTypes = object> = {
    state: Array<StateObject<any>>;
    props: PropTypes;
    children: RendererType<any>[];
    isMemo: boolean;
    isMounted: boolean;
    $dom: Array<BaseLiteralElement>;
    $children: BaseLiteralElement[];
    $self: BaseLiteralElement | null;
    $slot: Node,
    events: __keyableObjects<Function | Function[]>;
    useState<T>(initialValue: __lazyValue<T>): IHookResponse<T>;
    useEffect<T>(effect: Function, inputs?: Array<StateObject<T>>): void;
    useReducer<T, Action = Object>(
        reducer: ReducerInit<T, Action>,
        initialState: T,
        initialAction?: Action,
    ): ReducerResponse<T>;
    useChannel<T>(channel: __keyableTypes, __initValue:T, onObserve: (state: Context<T>) => void): ChannelStruct<T>
    useHook<MergedType>(fn: HookResolver<PropTypes>): MergedType & HookContext<PropTypes>;
    reactiveMount<T>(refName: __keyableTypes, componentTree: hookedType<T, BaseLiteralElement>[]): void;
};
export type hookedType<PropTypes,Other> = {
    [HOOK_SYMBOL]: HookContext<PropTypes>
} & Other;
export type HOC<
    PropTypes
> = (props: PropTypes, hookContext: HookContext<PropTypes>) => BaseLiteralElement;

export type PureComponent<PropTypes> = (props: PropTypes) => BaseLiteralElement;
export type ComponentRenderer<PropTypes> = HOC<PropTypes> | PureComponent<PropTypes>;
export type RendererType<PropTypes> = PureComponent<PropTypes> | hookedType<PropTypes, BaseLiteralElement>

export function hasHook(component: ComponentRenderer<any>): Boolean;
export function getHook(component: ComponentRenderer<any>): HookContext
export function useGlobalHook(hook: HookResolver<any>): void
export function invokeEvent(hookContext: HookContext, eventName: __keyableTypes): void
// 오모한 ReducerObject generic 재거
export function combineReducers(reducerObject: ReducerObject<any, object>): object
export function bindHook<PropTypes extends object>(props: PropTypes): HookResolver<PropTypes> & HookContext<PropTypes> 
export function c<
    PropTypes = any,
    __ComponentRenderType = ComponentRenderer<PropTypes>,
>(
    component: __ComponentRenderType,
    props: PropTypes,
    children: RendererType<any>[]
): hookedType<PropTypes, BaseLiteralElement>
