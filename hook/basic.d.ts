import { BaseLiteralElement } from "...ts";


type Dispatcher<T> = (p: T) => void
export class StateObject<T, Dispatcher extends Dispatcher<T>> {
    get [0](): T;
    get [1](): Dispatcher
    *[Symbol.iterator]() {
        yield this[0];
        yield this[1];
    }
}
export class Context<T> {
    constructor(value, nth): ProxyConstructor<Context<T>>
    toString(): string
    valueOf(): T
    [Symbol.toPrimitive](): T
    static convert<T>(value, nth): Context<T>
}
type IHookResponse<T, Dispatcher> = StateObject<T, Dispatcher>
type StateResponse<T> = IHookResponse<T, (newState: T) => void>;
type ReducerResponse<T> = IHookResponse<T, (action: Object) => void>;
type ReducerInit<T, Action> = (state: T, action: Action) => T
type __keyableTypes = (String | Symbol);
type __keyableObjects<T> = {
    [key in __keyableTypes]: T
}
type HookResolver = __keyableObjects<Function>;
type ReducerObject = __keyableObjects<ReducerInit>;

export function useState<T>(context: Context<T>, initialValue: T, _lazySetter: (value: T) => T): StateResponse<T>;
export function useEffect(context: Context<T>, effect: Function, inputs?: Array<any>): void;
export function useContext<T>(value: T): Context<T>;
export function useReducer<T, Action = Object>(
    reducer: ReducerInit<T, Action>,
    initialState: T,
    initialAction?: Action,
): ReducerResponse<T>;

export type HookContext<T, PropTypes = any> = {
    state: Array<StateObject<T>>;
    props: PropTypes;
    $dom: Array<BaseLiteralElement>;
    render() : BaseLiteralElement
    events: {
        [EVENT_NAME.mount]: (context) => {},
        [EVENT_NAME.unMount]: (context) => {},
        [EVENT_NAME.watch]: Array<Function>
    },
    useState<T>(initialValue: T, _lazySetter: (value: T) => T): IHookResponse<T>
    useEffect<T>(effect: Function, inputs?: Array<StateObject<T>>): void
    useReducer<T, Action = Object>(
        reducer: ReducerInit<T, Action>,
        initialState: T,
        initialAction?: Action,
    ): ReducerResponse<T>
    useHook<Resolver extends HookResolver>(fn): Resolver & HookContext<T, PropTypes>;
};
export type hookedType<T extends HookContext, Other> = {
    [Symbol("@@Hook")]: HookContext<T, PropTypes>
} & Other;
export type ComponetType<
    T, 
    PropTypes,
    __Props = {item: object} & PropTypes, 
    __HookContext = HookContext<T, __Props>,
    __WellNodeType = hookedType<__HookContext,BaseLiteralElement>
> = (props: __Props, hookContext: __HookContext) => BaseLiteralElement;
export type PureComponentType<PropTypes> = (props: PropTypes) => BaseLiteralElement;
export type ComponentRendererType<T, PropTypes> = ComponetType<T, PropTypes> | PureComponentType<PropTypes>;

export function isHooked(component): Boolean;
export function getHook(component): hookContext
export function useGlobalHook(hook): void
export function invokeEvent(hookContext, eventName): void
export function combineReducers(reducerObject: ReducerObject): object
export function bindHook<T, PropTypes extends object>(render: ()=> BaseLiteralElement, props: PropTypes): HookResolver & HookContext<T, PropTypes> 
export function c<
    T, 
    PropTypes,
    __ComponentRenderType = ComponentRendererType<T, PropTypes>,
>(
    component: __ComponentRenderType,
    props: PropTypes,
    children: [__ComponentRenderType]
): BaseLiteralElement