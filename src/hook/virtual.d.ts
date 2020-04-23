import { ComponentRenderer, RendererType, hookedType } from "./basic";

export class VirtualComponent<PropTypes, BaseType> {
    constructor($base: BaseType);
    $base: BaseType;
    _refPaths: [];
    collect(): {};
    compile(): void;
    update(data: PropTypes): void | never;
    remove(): void | never;
    static createInstance<BaseType, MergeType extends typeof VirtualComponent>(
        $ref: BaseType
    ): BaseType & InstanceType<MergeType>;
}
export class DomComponent<
    PropTypes,
    BaseType = HTMLElement
> extends VirtualComponent<PropTypes, BaseType> {
    update(data: PropTypes): void;
    remove(): void;
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
