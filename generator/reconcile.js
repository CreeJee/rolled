import { reconcile } from "../base/reconcile.js";
class ReconcileGenError extends Error {
    constructor(msg) {
        super(msg);
    }
}

const noOpUpdate = (current) => {};
const noOpCond = (current, before) => true;
const updater = (old, view, isUpdate = noOpCond, onUpdate = noOpUpdate) => {
    //needs bound self
    return function __nestedUpdate__(item) {
        const collector = view.collect(this);
        for (const key in collector) {
            const current = item[key];
            const before = old[key];
            if (current !== before && isUpdate(current, before)) {
                onUpdate(current);
            }
        }
    };
};
const createItem = (item, itemGroup) => {
    const root = itemGroup.cloneNode(true);
    let rootChild = root.firstChild;
    let itemChild = itemGroup.firstChild;
    if (rootChild !== null && itemChild !== null) {
        do {
            rootChild.update = updater(item, itemChild);
            updater({}, itemChild).call(rootChild, item);
        } while (
            (rootChild = rootChild.nextSibling) &&
            (itemChild = itemChild.nextSibling)
        );
    }
    return root;
};
export const create = (view, data, child) => {
    if (!Array.isArray(data)) {
        throw new ReconcileGenError("data is must Array!");
    }
    const { ref } = view.collect(view);
    let renderedItems = [];

    view.update = function(data) {
        reconcile(
            ref,
            renderedItems,
            data,
            (item) => createItem(item, child),
            (node, item) => node.update(item)
        );
        renderedItems = data.slice();
    };
    view.update(data);
    return view;
};
// 유사 hook ㄱ?
const hookTable = new Map();
export function useReconclie(self, onCycle) {
    let hookRef = [];
    const effect = () => {
        const unMount = onCycle();
        const unMountEffect = () => {
            unMount();
        };
        hookRef.push(unMountEffect);
        hookRef.splice(hookRef.indexOf(onCycle), 1);
    };
    if (hookTable.has(self)) {
        hookRef = hookTable.get(self);
    } else {
        hookTable.set(self, hookRef);
    }
    hookRef.push(effect);
}

export default create;
