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
type IHookResponse<T, Dispatch extends Dispatcher<T> = Dispatcher<T>> = StateObject<T, Dispatch>
type StateResponse<T> = IHookResponse<T, (newState: T) => void>;
type ReducerResponse<T> = IHookResponse<T, (action: Object) => void>;
type ReducerInit<T, Action> = (state: T, action: Action) => T
type __keyableTypes = (string | symbol);
type __keyableObjects<T> = {
    [key in __keyableTypes]: T
}
type HookResolver = __keyableObjects<Function>;
type ReducerObject<State, Action extends object> = __keyableObjects<ReducerInit<State, Action>>;

export function useState<T>(context: Context<T>, initialValue: T, _lazySetter: (value: T) => T): StateResponse<T>;
export function useEffect<T>(context: Context<T>, effect: Function, inputs?: Array<Context<any>>): void;
export function useContext<T>(value: T): Context<T>;
export function useReducer<T, Action = Object>(
    reducer: ReducerInit<T, Action>,
    initialState: T,
    initialAction?: Action,
): ReducerResponse<T>;
export function memo<T>(handler: ()=> T): () => T 
// TODO : 오모한 T 재거
export type HookContext<PropTypes = object> = {
    state: Array<StateObject<any>>;
    props: PropTypes;
    $dom: Array<BaseLiteralElement>;
    $self: BaseLiteralElement | null;
    $children: [BaseLiteralElement];
    events: __keyableObjects<Function | [Function]>;
    useState<T>(initialValue: T, _lazySetter: (value: T) => T): IHookResponse<T>;
    useEffect<T>(effect: Function, inputs?: Array<StateObject<T>>): void;
    useReducer<T, Action = Object>(
        reducer: ReducerInit<T, Action>,
        initialState: T,
        initialAction?: Action,
    ): ReducerResponse<T>
    useHook<Resolver extends HookResolver = HookResolver>(fn: HookResolver): Resolver & HookContext<PropTypes>;
};
export type hookedType<PropTypes,Other> = {
    [HOOK_SYMBOL]: HookContext<PropTypes>
} & Other;
export type HOC<
    PropTypes
> = (props: PropTypes, hookContext: HookContext<PropTypes>) => hookedType<PropTypes, BaseLiteralElement>;

export type PureComponent<PropTypes> = (props: PropTypes) => BaseLiteralElement;
export type ComponentRenderer<PropTypes> = HOC<PropTypes> | PureComponent<PropTypes>;

export function hasHook(component: ComponentRenderer<any>): Boolean;
export function getHook(component: ComponentRenderer<any>): HookContext
export function useGlobalHook(hook: HookResolver): void
export function invokeEvent(hookContext: HookContext, eventName: __keyableTypes): void
// 오모한 ReducerObject generic 재거
export function combineReducers(reducerObject: ReducerObject<any, object>): object
export function bindHook<PropTypes extends object>(props: PropTypes): HookResolver & HookContext<PropTypes> 
export function c<
    PropTypes,
    __ComponentRenderType = ComponentRenderer<PropTypes>,
>(
    component: __ComponentRenderType,
    props: PropTypes,
    children: [__ComponentRenderType]
): hookedType<PropTypes, BaseLiteralElement>
