import { LayoutGenError } from "./core.js";
import { bindHook, __createComponent, setHook } from "./basic.js";
// @ts-check
const COMPONENT_SYMBOL = Symbol("@@DomComponent");
function resolvePrototypeTree(obj) {
    if (obj.constructor === Object) {
        return {};
    }
    return {
        ...resolvePrototypeTree(Object.getPrototypeOf(obj)),
        ...Object.getOwnPropertyDescriptors(obj),
    };
}
export class VirtualComponent {
    constructor($base) {
        this.$base = $base;
    }
    collect(node) {
        return {};
    }
    compile() {}
    update(_data) {
        throw new LayoutGenError("need [VirtualLayout.update]");
    }
    remove() {
        throw new LayoutGenError("need [VirtualLayout.remove]");
    }
    static createInstance($ref) {
        const result = new this($ref);
        for (const k in resolvePrototypeTree(result)) {
            if (k === "constructor") {
                continue;
            }
            Object.defineProperty($ref, k, {
                //잠재적이슈 (property로 설정된 함수가 bind되면 ref를 찾을수없음)
                ...(typeof result[k] === "function"
                    ? { value: result[k].bind(result), writable: true }
                    : { get: () => result[k] }),
                enumerable: false,
                configurable: true,
            });
        }
        return $ref;
    }
}
export class DomComponent extends VirtualComponent {
    constructor(domRef) {
        super(domRef);
        Object.defineProperty(domRef, COMPONENT_SYMBOL, { value: this });
    }
    update(_data) {}
    remove() {}
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
        const item = LayoutClass.createInstance(current, LayoutClass);
        setHook(item, hookContext);
        return item;
    };
};
export const domRef = (component, props, children) => {
    return virtual(DomComponent, component, props, children);
};
