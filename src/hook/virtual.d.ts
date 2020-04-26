import {
    ComponentRenderer,
    RendererType,
    hookedType,
    HookContext,
    VirtualBaseComponent,
} from "./basic";
export class VirtualComponent<PropTypes, BaseType> extends VirtualBaseComponent<
    PropTypes
> {
    constructor($base: BaseType, context: HookContext<PropTypes>);
    $self: HookContext<PropTypes>;
    $base: BaseType;
    _refPaths: [];
    collect(): {};
    compile(): void;
    update(): void | never;
    static createInstance<BaseType, MergeType extends typeof VirtualComponent>(
        $ref: BaseType
    ): BaseType & InstanceType<MergeType>;
}
export class DomComponent<
    PropTypes,
    BaseType = HTMLElement
> extends VirtualComponent<PropTypes, BaseType> {
    onUpdate(data: PropTypes): void;
    onRemove(): void;
}
export function virtual<
    BaseType,
    PropTypes = any,
    __VirtualComponent = VirtualComponent<PropTypes, BaseType>,
    __ComponentRenderType = ComponentRenderer<PropTypes, __VirtualComponent>
>(
    LayoutClass: __VirtualComponent,
    component: __ComponentRenderType,
    props: PropTypes,
    children: RendererType<any>[] | null
): hookedType<PropTypes, __VirtualComponent>;
