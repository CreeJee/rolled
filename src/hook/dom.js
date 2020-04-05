import { hasHook, getHook, LayoutGenError } from "./core.js";
import { reconcile } from "../base/reconcile.js";
import { reuseNodes } from "../base/reuseNodes.js";
import { classListNodeType } from "../index.js";
import { invokeEvent } from "./event.js";
const onUpdate = (node, current, key) => {
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
const updater = (old, view, isUpdate = noOpCond) => {
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
        default:
            throw new LayoutGenError("unacceptable nodes");
    }
    return itemGroup;
};
export const __generateComponent = (item, component) => {
    let view = component(item);
    if (view instanceof Promise) {
        throw new LayoutGenError("lazy is not Promise (use rolled.lazy)");
    }
    const hook = getHook(view);
    const isHook = hasHook(view);
    const rendered = __bindDom(isHook ? hook.props : item, view);
    if (isHook) {
        invokeEvent(getHook(view), "mount");
    }
    return rendered;
};
export const __forceGenerateTags = (
    parent,
    renderedItems,
    childs,
    refCollector = [],
    renderer = reconcile
) => {
    renderer(
        parent,
        renderedItems,
        childs,
        (hoc, nth) => {
            const view = __generateComponent({}, hoc);
            // tricky solution
            // @ts-ignore
            if (view.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
                throw new LayoutGenError("slot is must not fragment");
            }
            refCollector.splice(nth, 0, view);
            return view;
        },
        (node, item) => node.update(item)
    );
    return refCollector;
};
export const __generateChildren = (parent, childs, renderer = reconcile) => {
    let renderedItems = [];
    let components = [];
    if (Array.isArray(childs)) {
        if (!("update" in parent)) {
            parent.update = function (data) {
                renderer(
                    parent,
                    renderedItems,
                    childs,
                    (hoc, nth) => {
                        const view = __generateComponent({}, hoc);
                        components[nth] = view;
                        return view;
                    },
                    (node, item) => node.update(item)
                );
                renderedItems = childs.slice();
            };
        }
        parent.update(childs.slice());
    }
    return components;
};
