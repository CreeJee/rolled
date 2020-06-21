import { StateObject } from "./core";
import {Maybe, Alies, Except} from "../util"
//Logic
export interface IBaseComponent {
    isMemo: boolean;
    isMounted: boolean;
}
interface ComponentStruct<Props,Parent,Children> extends IBaseComponent{
    props: Props,
    parent: Parent,
    children: Children,
}
export type MaybeBaseComponent<C extends IBaseComponent = IBaseComponent> = Maybe<C>;

export interface IComponent<
    Props,
    ParentComponent extends MaybeBaseComponent = MaybeBaseComponent,
    ChildComponents extends IBaseComponent[] = IBaseComponent[]
> extends IBaseComponent,ComponentStruct<Partial<Props>,ParentComponent,ChildComponents> {}
export type InferComponent<T> = (
    T extends IComponent<infer Props,infer Parent, infer Children> ?
        T :
        never
);
export type ComponentPlugin<Extra, T> = Except<Extra,never,InferComponent<T> & Alies<Extra>>;
export type HookMixer<T, Resolver> = (component: T) => Alies<Resolver>;
export class BaseComponent<
    Props,
    ParentComponent extends MaybeBaseComponent,
    ChildComponents extends IBaseComponent[]
> implements IComponent<Props, ParentComponent, ChildComponents> {
    #state: StateObject<any>[] = [];
    #$dom = [];
    #$children = [];
    #$self = null;
    #$slot = null;
    //plugins
    #plugins = [];
    
    props = {};
    parent: ParentComponent;
    isMemo = false;
    isMounted = false;
    children: ChildComponents;
    // ...__createStore(), /// search from context tree store value
    // ...eventData,
    constructor(
        props: Props,
        parent: ParentComponent,
        ...children: ChildComponents
    ) {
        this.children = children;
        this.props = props;
        this.parent = parent;
    }
    static createRoot<Props, ChildComponents extends IBaseComponent[]>(
        props: Props,
        ...children: ChildComponents
    ) {
        return new this(props, null, ...children);
    }
    // create mixin action
    // and call mixins
    // it will be shallow clone (s)

    //TODO: infer 에 대한 적극적인 처리 필요
    static use<
        Component,
        Hooks,
        Mix extends HookMixer<InferComponent<Component>, Hooks>
    >(component: InferComponent<Component>, hookResolve: Mix): Hooks {
        return hookResolve(component);
    }
}
export class Component<
    Props,
    ParentComponent extends MaybeBaseComponent,
    ChildComponents extends IBaseComponent[]
> extends BaseComponent<Props, ParentComponent, ChildComponents> {}
