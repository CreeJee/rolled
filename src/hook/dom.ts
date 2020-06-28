import { LayoutGenError, VirtualBaseComponent } from "./core.js";
import {
    BaseLiteralElement,
    BaseAttribute,
    RefType,
    RefBase,
} from "../base/index.js";
import { reconcile } from "../base/reconcile.js";
import { classListNodeType } from "../base/index.js";
import { invokeEvent } from "../plugins/event.js";
import { DomComponent } from "./legacy/_virtual.js";
import reuseNodes from "../base/reuseNodes.js";
import { valueOf, toString, Transform } from "../util.js";

type UpdaterType<Data, NodeLike extends Node> = BaseLiteralElement<
    Data,
    NodeLike
> & {
    update: (this: NodeLike, item: RefType<Data>) => void | undefined;
};

const nodeDefaultUpdate = <T, NodeLike extends Node>(
    node: BaseAttribute<NodeLike, T>,
    current: Transform<T, "toString">,
    k: keyof T
) => {
    switch (node.nodeType) {
        case Node.TEXT_NODE:
        case Node.ATTRIBUTE_NODE:
            node.nodeValue = toString(current);
            break;
        default:
            throw new LayoutGenError("unaccepted data");
    }
};
const virtualDefaultUpdate = <T, NodeLike extends typeof VirtualBaseComponent>(
    node: BaseAttribute<NodeLike, T>,
    current: Transform<T, "toString">,
    k: keyof T
) => node.update(current);
const noOpCond = <T>(current: T, old: T) => true;
const updater = <T, ElementType extends Node>(
    old: RefType<T>,
    view: BaseLiteralElement<T, Node>,
    isUpdate = noOpCond,
    onUpdate: typeof nodeDefaultUpdate
) => {
    //needs bound self
    return function __nestedUpdate__(this: ElementType, item: RefType<T>) {
        const collectors = view.collect();
        for (const key in collectors) {
            const collector = collectors[key] as any;
            const current = valueOf(item[key]);
            const before = valueOf(old[key]);
            if (current !== before && isUpdate(current, before)) {
                onUpdate(collector, current, key);
                old[key] = current;
            }
        }
    };
};
const __toUpdatable = <NodeLike extends Node, Data>(
    data: Data,
    node: UpdaterType<Data, NodeLike>,
    isUpdate = noOpCond,
    onUpdate = nodeDefaultUpdate
) => {
    node.update = updater(data as RefType<Data>, node, isUpdate, onUpdate);
    return node;
};
export function __bindFragment({ ...item }, fragment: DocumentFragment) {
    let rootChild = fragment.firstChild;
    if (rootChild !== null) {
        do {
            __toUpdatable(
                item,
                rootChild as UpdaterType<typeof item, typeof rootChild>
            );
        } while ((rootChild = rootChild.nextSibling));
    }
}
export function __bindElement({ ...item }, node: Element) {
    __toUpdatable(item, node as UpdaterType<typeof item, typeof node>);
}
// export function __bindVirtual(
//     { ...item },
//     node: VirtualBaseComponent<typeof item>
// ) {
//     __toUpdatable(
//         item,
//         node as UpdaterType<typeof item, typeof node>,
//         node.isUpdate,
//         node.onUpdate
//     );
// }

export const __invokeComponent = (item, component) => {
    let view = component(item);
    if (view instanceof Promise) {
        throw new LayoutGenError("component is not Promise (use rolled.lazy)");
    }
    return view;
};
//render to component used functional components
export const __forceGenerateTags = (
    parent,
    renderedItems,
    childs,
    refCollector = [],
    renderer = parent instanceof HTMLElement ? reconcile : reuseNodes
) => {
    const createdViews: [hElement, object][] = [];
    if (
        !(
            parent instanceof HTMLElement ||
            parent instanceof VirtualBaseComponent
        )
    ) {
        throw new Error("parent target is must HTMLElement");
    }
    renderer(
        parent,
        renderedItems,
        childs,
        (hoc, nth) => {
            // const item = {};
            const view = __invokeComponent({}, hoc);
            if (
                !(
                    view instanceof HTMLElement ||
                    view instanceof VirtualBaseComponent
                )
            ) {
                throw new Error(
                    "each view is must [HTMLElement|VirtualBaseComponent]"
                );
            }
            refCollector.splice(nth, 0, view);
            createdViews.push(view);
            return view instanceof DomComponent ? view.$base : view;
        },
        (node, item) => {
            node.update(item);
        }
    );
    const updatedViews = createdViews.splice(0);
    for (const view of updatedViews) {
        const hook = getHook(view);
        const isHook = hasHook(view);
        view.compile();
        __bindDom(isHook ? hook.props : {}, view);
        if (isHook) {
            invokeEvent(getHook(view), "mount");
        }
    }
    return refCollector;
};
export const __generateChildren = (parent, childs) => {
    let renderedItems = [];
    let components = [];
    if (Array.isArray(childs)) {
        if (!("update" in parent)) {
            parent.update = function () {
                __forceGenerateTags(parent, renderedItems, childs, components);
                renderedItems = childs.slice();
            };
        }
        parent.update(childs.slice());
    }
    return components;
};
