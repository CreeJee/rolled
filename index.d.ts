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
    collect(node: Node): RefObj;
}
interface hElement extends HTMLElement,BaseLiteralElement {}
interface fragmentElement extends DocumentFragment, BaseLiteralElement{}
export function compile(node: Node): void;
export default function h(strings: TemplateStringsArray, ...args: any[]): hElement;
export function fragmentCompile(node: Node): void;
export default function fragment(strings: TemplateStringsArray, ...args: any[]): fragmentElement;
