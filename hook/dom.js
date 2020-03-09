import { invokeEvent, isHooked, getHook } from "./basic.js";
import { reconcile } from "../base/reconcile.js";
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
const updater = (old, view, isUpdate = noOpCond) => {
    //needs bound self
    return function __nestedUpdate__(item) {
        const collector = view.collect(this);
        for (const key in collector) {
            const current = item[key];
            const before = old[key];
            if (current !== before && isUpdate(current, before)) {
                onUpdate(collector[key], current, key);
            }
        }
    };
};
export const __generateDom = (item, itemGroup, isUpdate) => {
    // const root = itemGroup.cloneNode(true);
    const root = itemGroup;
    let rootChild = root.firstChild;
    let itemChild = itemGroup.firstChild;
    if (rootChild !== null && itemChild !== null) {
        do {
            rootChild.update = updater(item, itemChild, isUpdate);
            updater({}, itemChild, isUpdate).call(rootChild, item);
        } while (
            (rootChild = rootChild.nextSibling) &&
            (itemChild = itemChild.nextSibling)
        );
    }
    return root;
};
export const __generateComponent = (item, component) => {
    const view = component(item);
    if (view instanceof Promise) {
        throw new LayoutGenError("lazy-renderer is not supproted");
    }
    const rendered = __generateDom(item, view);
    if (isHooked(view)) {
        invokeEvent(getHook(view), "mount");
    }
    return rendered;
};
export const __generateChildren = (parent, childs, renderer = reconcile) => {
    let renderedItems = [];
    parent.update = function(data) {
        renderer(
            parent,
            renderedItems,
            childs,
            (hoc) => {
                const view = hoc({});
                let item = {};
                if (isHooked(view)) {
                    item = getHook(view).props;
                }
                return __generateDom(item, view);
            },
            (node, item) => node.update(item)
        );
        renderedItems = childs.slice();
    };
    parent.update(childs.slice());
    return parent;
};
