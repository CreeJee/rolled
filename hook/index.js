import { __generateComponent } from "./dom.js";
import { reuseNodes } from "../base/reuseNodes.js";
export * from "./basic.js";
export const render = (parent, component) => {
    let renderedItems = [];

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
