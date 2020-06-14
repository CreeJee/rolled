import { StateObject } from "./core";
import {Maybe, Alies} from "../util"
//Logic
interface ComponentStruct<Props,Parent,Children>{
    props: Props,
    parent: Parent,
    children: Children,
}
export interface IBaseComponent {
    isMemo: boolean;
    isMounted: boolean;
}
export type MaybeBaseComponent<C extends IBaseComponent = IBaseComponent> = Maybe<C>;
export interface IComponent<
    Props,
    ParentComponent extends MaybeBaseComponent = MaybeBaseComponent,
    ChildComponents extends IBaseComponent[] = IBaseComponent[]
> extends IBaseComponent,ComponentStruct<Partial<Props>,ParentComponent,ChildComponents> {}
export type InferComponent<T> = (
    T extends IComponent<infer Props,infer Parent, infer Children> ?
        ComponentStruct<Props,Parent,Children> :
        IComponent<any>
);
export type ComponentPlugin<Extra, T> = InferComponent<T> & Alies<Extra>;
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
}
export class Component<
    Props,
    ParentComponent extends MaybeBaseComponent,
    ChildComponents extends IBaseComponent[]
> extends BaseComponent<Props, ParentComponent, ChildComponents> {}
