import { __generateComponent, __forceGenerateTags } from "./dom.js";
import { reuseNodes } from "../base/reuseNodes.js";
import { getHook, hasHook, invokeEvent } from "./basic.js";
import { fragment, h } from "../base/index.js";
import { LayoutGenError } from "./core.js";

//JUST global render do not duplicated renderer
const __renderObserver = new MutationObserver((mutations) => {
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
    subtree: true,
};
const bindDomMutation = (parent) => {
    __renderObserver.observe(parent, config);
    return parent;
};
export const render = (parent, component) => {
    let renderedItems = [];
    let refCollector = [];
    if (!(parent instanceof HTMLElement) || !parent.isConnected) {
        throw new LayoutGenError(
            "render parent must HTMLElement and connected from document tree"
        );
    }
    bindDomMutation(parent);
    parent.update = function (data) {
        __forceGenerateTags(
            parent,
            renderedItems,
            data,
            refCollector,
            reuseNodes
        );
        renderedItems = data.slice();
    };
    parent.update([component]);
    return parent;
};

const rootTag = "div";
export const shadow = (strings, ...args) => {
    //1.tree를 iterate돌릴때 parent 가 붙지않는다
    //  그리되니까 ref가 iterate가 안돔
    //  결국 root는 ref를 못가져옴
    //
    //2.그러면 fragment로함
    //  그럴때 root는 자동생성되서 업데이트 할수없음
    //  root와 child-zone이 따로하게됨
    //      이부분의 사이드이팩트는 예상안감
    //  대신 fragment로 root없이 태그를 부착가능
    const result = fragment(strings, ...args);
    const root = document.createElement(rootTag);
    const shadow = root.attachShadow({ mode: "open" });
    bindDomMutation(shadow);
    shadow.appendChild(result);
    root.collect = ($dom = result) => result.collect.call(null, shadow);
    root.compile = () => result.compile();
    return root;
};
