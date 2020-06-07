import { StateObject } from "./core";
export interface IBaseComponent {
    isMemo: boolean;
    isMounted: boolean;
}
export type MaybeBaseComponent<T = IBaseComponent> = T | null;
export interface IComponent<
    Props,
    ParentComponent extends MaybeBaseComponent,
    ChildComponents extends IBaseComponent[]
> extends IBaseComponent {
    props: Partial<Props>;
    parent: ParentComponent;
    children: ChildComponents;
}

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
