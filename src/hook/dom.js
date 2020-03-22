import { hasHook, getHook } from "./core.js";
import { reconcile } from "../base/reconcile.js";
import { invokeEvent } from "./event.js";
export class LayoutGenError extends Error {
    constructor(msg) {
        super(msg);
    }
}
const onUpdate = (node, current, key) => {
    switch (node.nodeType) {
        case Node.ELEMENT_NODE:
            node.setAttribute(key, current);
            break;
        case Node.TEXT_NODE:
            node.nodeValue = current;
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
export const __generateChildren = (parent, childs, renderer = reconcile) => {
    let renderedItems = [];
    let components = [];
    if (Array.isArray(childs)) {
        if (parent.childNodes.length > 0) {
            throw new LayoutGenError(
                "child node is already exists might be work wrong"
            );
        }
        parent.update = function(data) {
            renderer(
                parent,
                renderedItems,
                childs,
                (hoc, nth) => {
                    const view = __generateComponent({}, hoc);
                    // tricky solution
                    // @ts-ignore
                    components[nth] = view;
                    return view;
                },
                (node, item) => node.update(item)
            );
            renderedItems = childs.slice();
        };
        parent.update(childs.slice());
    }
    return components;
};
