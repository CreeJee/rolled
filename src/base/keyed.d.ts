export function keyed<Keys,T,OutTag extends HTMLElement>(
    key: Exclude<Keys,string> extends never ? Keys : string,
    parent: HTMLElement,
    renderedValues: OutTag[],
    data: T[],
    createFn: (data: T, nth: number) => OutTag,
    noOp?: (node: OutTag, item: T) => void,
    beforeNode?: OutTag,
    afterNode?: OutTag
): void;
export default keyed;