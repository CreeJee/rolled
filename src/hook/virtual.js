import { LayoutGenError, VirtualBaseComponent, getHook } from "./core.js";
import { bindHook, __createComponent, hookSymbol } from "./basic.js";
import { __generateChildren } from "./dom.js";
function resolvePrototypeTree(obj) {
    if (obj.constructor === Object) {
        return {};
    }
    return {
        ...resolvePrototypeTree(Object.getPrototypeOf(obj)),
        ...Object.getOwnPropertyDescriptors(obj),
    };
}
/**
 * @template T,V
 * @param {import("./basic.js").HookContext<T>} parentContext
 * @param {import("./basic.js").HookContext<V>} targetContext
 */
const expectParent = (parentContext, target, nodeName) => {
    if (!parentContext.$children.includes(target)) {
        throw new LayoutGenError(`${nodeName} is not contains parent`);
    }
};
export class VirtualComponent extends VirtualBaseComponent {
    constructor($base, context) {
        super();
        this.$base = $base;
        this[hookSymbol] = context;
        context.$self = this;
    }
    //dom mocking
    insertBefore(node, afterNode) {
        const context = getHook(this);
        const $child = parentContext.$children;
        expectParent(context, afterNode, "afterNode");
        $child.splice($child.indexOf(afterNode), 0, node);
    }
    appendChild(node) {
        const parentContext = getHook(this);
        parentContext.$children.push(node);
        return node;
    }
    removeChild(node) {
        const parentContext = getHook(this);
        const $child = parentContext.$children;
        expectParent(parentContext, node, "node");
        $child.splice($child.indexOf(node), 1);
        node.onRemove();
        return node;
    }
    //ref
    collect(node) {
        return {};
    }
    compile() {}
    //mocked
    static createInstance($ref, context) {
        return new this($ref, context);
    }
}
export class DomComponent extends VirtualComponent {
    constructor(domRef, context) {
        super(domRef, context);
    }
    onUpdate(_data) {}
    onRemove() {}
    // static createInstance($ref, context) {
    //     const result = new this($ref, context);
    //     const $base = result.$base;
    //     for (const k in resolvePrototypeTree(result)) {
    //         if (k === "constructor") {
    //             continue;
    //         }
    //         Object.defineProperty($base, k, {
    //             //잠재적이슈 (property로 설정된 함수가 bind되면 ref를 찾을수없음)
    //             //크리티컬 이슈: ref가 있는상태에서 쓰게되면 바운드되서 암것도못함
    //             ...(typeof result[k] === "function"
    //                 ? { value: result[k].bind(result), writable: true }
    //                 : { get: () => result[k] }),
    //             enumerable: false,
    //             configurable: true,
    //         });
    //     }
    //     return $base;
    // }
}
export const virtual = (LayoutClass, component, props, children) => {
    return (_item) => {
        if (!(LayoutClass.prototype instanceof VirtualComponent)) {
            throw new LayoutGenError(
                "LayoutClass must extends VirtualComponent"
            );
        }
        const hookContext = bindHook({ ...props }, children);
        const current = __createComponent(component, props, hookContext);
        const item = LayoutClass.createInstance(current, hookContext);
        hookContext.$children = __generateChildren(item, children);
        return item;
    };
};
export const domRef = (component, props, children) => {
    return virtual(DomComponent, component, props, children);
};
