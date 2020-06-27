export function reuseNodes<T,OutTag extends HTMLElement>(
    parent: HTMLElement,
    renderedValues: OutTag[],
    data: T[],
    createFn: (data: T, nth: number) => OutTag,
    noOp?: (node: OutTag, item: T) => void,
    beforeNode?: OutTag,
    afterNode?: OutTag
): void;
export default reuseNodes;