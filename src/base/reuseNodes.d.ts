export function reuseNodes(
    parent: HTMLElement,
    renderedValues: any[],
    data: any[],
    createFn: (data: object, nth: Number) => HTMLElement,
    noOp?: (node: HTMLElement, item: object) => void,
    beforeNode?: Node,
    afterNode?: Node): void;
export default reuseNodes;