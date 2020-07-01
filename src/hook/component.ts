import { StateObject } from "./core";
import { Maybe, Alies, Except } from "../util";
import { BaseLiteralElement } from "../base";
//Logic
export interface IBaseComponent {
    isMemo: boolean;
    isMounted: boolean;
}

interface ComponentStruct<
    Props,
    Children,
    Parent extends MaybeBaseComponent = MaybeBaseComponent
> extends IBaseComponent {
    props: Props;
    parent: Parent;
    children: Children;
}
export type MaybeBaseComponent<
    C extends IBaseComponent = IBaseComponent
> = Maybe<C>;

export type InferComponent<T, Q = never> = T extends ComponentStruct<
    infer Props,
    infer Children,
    infer Parent
>
    ? T
    : Q;
type InferParent<Parent> = InferComponent<Parent, null>;
export interface IComponent<
    Props,
    ChildComponents extends IBaseComponent[],
    ParentComponent
>
    extends IBaseComponent,
        ComponentStruct<
            Partial<Props>,
            ChildComponents,
            InferParent<ParentComponent>
        > {}

export type ComponentPlugin<Extra, T> = Except<
    Extra,
    never,
    InferComponent<T> & Alies<Extra>
>;
export type HookMixer<T, Resolver> = (component: T) => Alies<Resolver>;

//todo: union renderer type is might bugged
type RenderedRef<Props> = BaseLiteralElement<Props, Element | DocumentFragment>;
export type Renderer<Props> = (props: Props) => RenderedRef<Props>;

export class BaseComponent<
    Props,
    ChildComponents extends IBaseComponent[],
    ParentComponent
> implements IComponent<Props, ChildComponents, ParentComponent> {
    #state: StateObject<any>[] = [];
    #$dom = [];
    #$children = [];
    #$self: RenderedRef<Props>;
    #$slot = null;

    props: Props = {} as Props;
    parent: InferParent<ParentComponent>;
    isMemo = false;
    isMounted = false;
    children: ChildComponents;
    constructor(
        render: Renderer<Props>,
        props: Props,
        ...children: ChildComponents
    ) {
        this.#$self = render(props);
        this.children = children;
        this.props = props;
        this.parent = null as InferParent<ParentComponent>;
    }
    static createComponent<Props, ChildComponents extends IBaseComponent[]>(
        render: Renderer<Props>,
        props: Props,
        ...children: ChildComponents
    ) {
        return new this(render, props, ...children);
    }
}

export class Component<
    Props,
    ParentComponent,
    ChildComponents extends IBaseComponent[]
> extends BaseComponent<Props, ChildComponents, ParentComponent> {
    private static applyComponent<Static, Types extends HookMixer<any, any>[]>(
        component: InferComponent<Static>,
        ...types: Types
    ) {
        return types.reduce(
            (component, resolve) => this.bound(component, resolve),
            component
        );
    }
    static createMixinComponent<
        Props,
        ParentComponent,
        ChildComponents extends IBaseComponent[],
        Types extends HookMixer<any, any>[]
    >(
        render: Renderer<Props>,
        props: Props,
        children: ChildComponents,
        ...types: Types
    ) {
        return this.applyComponent(
            this.createComponent(render, props, ...children),
            ...types
        );
    }
    // create mixin action
    // and call mixins
    // it will be shallow clone (s)

    //TODO: infer 에 대한 적극적인 처리 필요
    static bound<
        Component,
        Hooks,
        Mix extends HookMixer<InferComponent<Component>, Hooks>
    >(component: InferComponent<Component>, hookResolve: Mix): Hooks {
        return hookResolve(component);
    }
}
