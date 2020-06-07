import { Transform } from "../util";

declare class Ref {
    idx: number;
    ref: string | number;
    constructor(idx: number, ref: string | number);
}
type RefBase = { [K: string]: any };
type RefType<T extends RefBase = RefBase> = T;
// RefType은 비 결정적 임
// 런타임에 html 파싱하니 이부분은 라이브러리 고유 결함임
// 만약된다면 컴파일타임에 빌드 때리고 싶음
type BaseLiteralElement<T> = {
    _refPaths?: Ref[];
    //collect start node needs optional
    collect(node?: Node): RefType<T>;
    compile(): void | never;
};
type InterpolationType = Transform<NonNullable<any>, "toString">;
type hElement<RefType> = BaseLiteralElement<RefType> & HTMLElement;
type fragmentElement<RefType> = BaseLiteralElement<RefType> & DocumentFragment;
export type BaseAttribute<Extends, T = string> = {
    update(value: T): void;
} & Extends;
export function h<RefType>(
    strings: TemplateStringsArray,
    ...args: InterpolationType[]
): hElement<RefType>;
export function fragment<RefType>(
    strings: TemplateStringsArray,
    ...args: InterpolationType[]
): fragmentElement<RefType>;
export const classListNodeType: number;
