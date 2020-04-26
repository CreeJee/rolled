import { BaseLiteralElement, RefObj } from "../base/index";
import { HOOK_SYMBOL } from "./Symbol";

type Dispatcher<T> = (p: T) => void;
export type StateObject<T, Data = T> = [Context<T>, Dispatcher<Data>];
export class Context<T> {
    constructor(value: any, nth: number);
    toString(): string;
    valueOf(): T;
    value: T;
    [Symbol.toPrimitive](): T;
    static convert<T>(value: any, nth: number): Context<T>;
}
export class VirtualBaseComponent<PropTypes> {
    //impl
    onUpdate(data: PropTypes): never | void;
    onRemove(): never | void;
    isUpdate(current: PropTypes, old: PropTypes): boolean;
    // mock prototype extends chain
    get nodeType(): string;
    static get nodeType(): string;
}
export class ChannelStruct<T> extends Array<HookContext> {
    state: StateObject<T>;
}
export class LazyComponent<PropTypes> {
    constructor(
        load: () => Promise<RendererType<PropTypes>>,
        loadingComponent: () => RendererType<PropTypes>
    );
}

type ReducerResponse<T> = StateObject<T, Object>;
type ReducerInit<T, Action> = (state: T, action: Action) => T;
type __keyableTypes = string | symbol;
type __keyableObjects<T> = {
    [key in __keyableTypes]: T;
};
type __lazySetter<T> = () => T;
type __lazyValue<T> = T | __lazySetter<T>;
//TODO return type should generic
type HookResolver<PropTypes, ReturnType = any> = (
    hook: HookContext<PropTypes>
) => __keyableObjects<ReturnType>;
type ReducerObject<State, Action extends object> = __keyableObjects<
    ReducerInit<State, Action>
>;

export function useState<T>(
    context: Context<T>,
    initialValue: __lazyValue<T>
): StateObject<T>;
export function useLayoutState<T>(
    context: Context<T>,
    initialValue: __lazyValue<T>
): StateObject<T>;
export function useEffect<T>(
    context: Context<T>,
    effect: Function,
    inputs?: Array<Context<T>>
): void;
export function useContext<T>(value: T): Context<T>;
export function useReducer<T, Action = Object>(
    reducer: ReducerInit<T, Action>,
    initialState: T,
    initialAction?: Action
): ReducerResponse<T>;
export function useChannel<T>(
    context: Context<T>,
    channel: __keyableTypes,
    __initValue: T,
    onObserve?: (state: T) => void
): StateObject<T>;
export function reactiveMount<T, Data>(
    context: Context<T>,
    refName: __keyableTypes,
    componentTree: hookedType<Data, BaseLiteralElement>[]
): void;
export function reactiveTagMount<Data>(
    refTag: HTMLElement,
    componentTree: hookedType<Data, BaseLiteralElement>[]
): void;
export function memo<T>(handler: () => T): () => T;
export function lazy<PropTypes>(
    load: () => Promise<RendererType<PropTypes>>,
    loading?: () => RendererType<PropTypes>
): LazyComponent<PropTypes>;
export type HookContext<PropTypes = object> = {
    state: Array<StateObject<any>>;
    props: PropTypes;
    children: RendererType<any>[];
    isMemo: boolean;
    isMounted: boolean;
    $dom: Array<BaseLiteralElement>;
    $children: BaseLiteralElement[];
    $self: BaseLiteralElement | null;
    $slot: Node;
    events: __keyableObjects<Function | Function[]>;
    useState<T>(initialValue: __lazyValue<T>): StateObject<T>;
    useLayoutState<T>(initialValue: __lazyValue<T>): StateObject<T>;
    useEffect<T>(effect: Function, inputs?: Array<Context<T>>): void;
    useReducer<T, Action = Object>(
        reducer: ReducerInit<T, Action>,
        initialState: T,
        initialAction?: Action
    ): ReducerResponse<T>;
    useChannel<T>(
        channel: __keyableTypes,
        __initValue: T,
        onObserve?: (state: T) => void
    ): StateObject<T>;
    reactiveMount<T>(
        refName: __keyableTypes,
        componentTree: hookedType<T, BaseLiteralElement>[]
    ): void;
    useHook<MergedType>(
        fn: HookResolver<PropTypes>
    ): MergedType & HookContext<PropTypes>;
};
export type hookedType<PropTypes, Other> = {
    [HOOK_SYMBOL]: HookContext<PropTypes>;
} & Other;
export type HOC<PropTypes, ResultType = BaseLiteralElement> = (
    props: PropTypes,
    hookContext: HookContext<PropTypes>
) => ResultType;

export type PureComponent<PropTypes, ResultType = BaseLiteralElement> = (
    props: PropTypes
) => ResultType;
export type ComponentRenderer<PropTypes, ResultType = BaseLiteralElement> =
    | HOC<PropTypes, ResultType>
    | PureComponent<PropTypes, ResultType>;
export type RendererType<PropTypes, ResultType = BaseLiteralElement> =
    | PureComponent<PropTypes, ResultType>
    | hookedType<PropTypes, ResultType>;

export function hasHook(component: ComponentRenderer<any>): Boolean;
export function getHook(component: ComponentRenderer<any>): HookContext;
export function useGlobalHook(hook: HookResolver<any>): void;

export function invokeEvent(
    hookContext: HookContext<any>,
    eventName: __keyableTypes,
    options: {
        nth?: number;
    }
): void;

// 오모한 ReducerObject generic 재거
export function combineReducers(
    reducerObject: ReducerObject<any, object>
): object;
export function bindHook<PropTypes extends object>(
    props: PropTypes
): HookResolver<PropTypes> & HookContext<PropTypes>;
export function __createComponent<
    PropTypes = any,
    __ComponentRenderType = ComponentRenderer<PropTypes>
>(
    component: __ComponentRenderType,
    props: PropTypes,
    children: RendererType<any>[] | null
): hookedType<PropTypes, BaseLiteralElement>;
export function c<
    PropTypes = any,
    __ComponentRenderType = ComponentRenderer<PropTypes>
>(
    component: __ComponentRenderType,
    props: PropTypes,
    children: RendererType<any>[] | null
): hookedType<PropTypes, BaseLiteralElement>;
