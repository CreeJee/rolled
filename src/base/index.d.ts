declare class Ref {
    idx: number;
    ref: string | number;
    constructor(idx: number, ref: string | number);
}
interface RefObj {
    [key: string]: any;
}
interface BaseLiteralElement {
    _refPaths?: Ref[];
    //collect start node needs optional
    collect(node? : Node): RefObj;
    compile(): void | never;
}
interface hElement extends HTMLElement,BaseLiteralElement {}
interface fragmentElement extends DocumentFragment, BaseLiteralElement{}
export function h(strings: TemplateStringsArray, ...args: any[]): hElement;
export function fragment(strings: TemplateStringsArray, ...args: any[]): fragmentElement;
export const classListNodeType: string;