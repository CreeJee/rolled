import {
    hasHook,
    getHook,
    LayoutGenError,
    VirtualBaseComponent,
} from "./core.js";
import { hElement } from "../base/index.js";
import { reconcile } from "../base/reconcile.js";
import { classListNodeType } from "../base/index.js";
import { invokeEvent } from "./event.js";
import { DomComponent } from "./virtual.js";
import reuseNodes from "../base/reuseNodes.js";
const defaultUpdate = (node, current, key) => {
    switch (node.nodeType) {
        // case Node.ELEMENT_NODE:
        //     node.setAttribute(key, current);
        //     break;
        case Node.TEXT_NODE:
        case Node.ATTRIBUTE_NODE:
            node.nodeValue = current;
            break;
        case classListNodeType:
            node.update(current);
            break;
        default:
            throw new LayoutGenError("unaccepted data");
    }
};
const noOpCond = (current, before) => true;
const valueOf = (value) =>
    typeof value === "object" ? value.valueOf() : value;
const updater = (old, view, isUpdate = noOpCond, onUpdate = defaultUpdate) => {
    //needs bound self
    return function __nestedUpdate__(item) {
        const collector = view.collect(this);
        for (const key in collector) {
            const current = valueOf(item[key]);
            const before = valueOf(old[key]);
            if (current !== before && isUpdate(current, before)) {
                onUpdate(collector[key], current, key);
                old[key] = current;
            }
        }
    };
};
export const __bindDom = ({ ...item }, itemGroup) => {
    switch (itemGroup.nodeType) {
        case Node.DOCUMENT_FRAGMENT_NODE:
            let rootChild = itemGroup.firstChild;
            if (rootChild !== null) {
                do {
                    rootChild.update = updater(item, rootChild);
                    updater({}, rootChild).call(rootChild, item);
                } while ((rootChild = rootChild.nextSibling));
            }
            break;
        case Node.ELEMENT_NODE:
            itemGroup.update = updater(item, itemGroup);
            updater({}, itemGroup).call(itemGroup, item);
            break;
        case VirtualBaseComponent.nodeType:
            itemGroup.update = updater(
                item,
                itemGroup,
                itemGroup.isUpdate,
                itemGroup.onUpdate
            );
            updater({}, itemGroup, itemGroup.isUpdate, itemGroup.onUpdate).call(
                itemGroup,
                item
            );
            break;
        default:
            throw new LayoutGenError("unacceptable nodes");
    }
    return itemGroup;
};
export const __invokeComponent = (item, component) => {
    let view = component(item);
    if (view instanceof Promise) {
        throw new LayoutGenError("component is not Promise (use rolled.lazy)");
    }
    return view;
};
export const __forceGenerateTags = (
    parent,
    renderedItems,
    childs,
    refCollector = [],
    renderer = parent instanceof HTMLElement ? reconcile : reuseNodes
) => {
    /** @type {[hElement, object][]} */
    const createdViews = [];
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
            getHook(view).parent = getHook(parent);
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
            parent.update = function (data) {
                __forceGenerateTags(parent, renderedItems, childs, components);
                renderedItems = childs.slice();
            };
        }
        parent.update(childs.slice());
    }
    return components;
};
