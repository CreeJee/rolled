import { __generateComponent } from "./dom.js";
import { reuseNodes } from "../base/reuseNodes.js";
import { getHook, hasHook, invokeEvent } from "./basic.js";

//JUST global render do not duplicated renderer
const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        const { removedNodes } = mutation;
        if (removedNodes.length > 0) {
            for (const node of removedNodes) {
                if (hasHook(node)) {
                    invokeEvent(getHook(node), "unMount");
                }
                delete node.update;
                // TODO : unMount ref logic from './index.js'
            }
        }
    }
});
const config = {
    childList: true,
    subtree: true
};
export const render = (parent, component) => {
    let renderedItems = [];
    observer.observe(parent, config);
    parent.update = function(data) {
        reuseNodes(
            parent,
            renderedItems,
            data,
            (item) => __generateComponent(item, component),
            (node, item) => node.update(item)
        );
        renderedItems = data.slice();
    };
    parent.update([{}]);
    return parent;
};
