import { BaseLiteralElement, RefObj } from "../../base/index";
import { HOOK_SYMBOL } from "./_Symbol";
import {
    StateObject,
    Context,
    VirtualBaseComponent,
    __lazyValue,
    __keyableTypes,
    __keyableObjects,
    HookResolver,
    HookBase,
} from "./_core";

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
    inputs: Context<T>[]
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
export type HookContext<
    PropTypes = object
> = HookBase<BaseLiteralElement | null> & {
    events: __keyableObjects<Function | Function[]>;
    // store:
    useState<T>(initialValue: __lazyValue<T>): StateObject<T>;
    useLayoutState<T>(initialValue: __lazyValue<T>): StateObject<T>;
    useEffect<T>(effect: Function, inputs: Context<T>[]): void;
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
export function bindHook<PropTypes extends object, Extra, Globals>(
    props: PropTypes
): Extra & Globals & HookContext<PropTypes>;
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
