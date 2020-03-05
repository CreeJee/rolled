import { reconcile } from "../base/reconcile.js";
import { bindHook } from "./basic.js";
class ReconcileGenError extends Error {
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
            throw new ReconcileGenError("unaccepted data");
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
const createItem = (item, itemGroup, isUpdate, onUpdate) => {
    const root = itemGroup.cloneNode(true);
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

export const create = (view, component) => {
    const { ref } = view.collect(view);
    let renderedItems = [];

    view.update = function(data) {
        reconcile(
            ref,
            renderedItems,
            data,
            (item) => {
                const view = component(bindHook(component));
                if (view instanceof Promise) {
                    throw new ReconcileGenError(
                        "render function is not accepted Promise"
                    );
                    //TODO :support promise FunctionalComponent
                }
                return createItem(item, view);
            },
            (node, item) => node.update(item)
        );
        renderedItems = data.slice();
    };
    return view;
};
export default create;
