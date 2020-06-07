type ToString<T> = (this: T) => string;
type ToValueOf<T> = (this: T) => T;

type TransformAble<T> = {
    toString: {
        toString: ToString<T>;
    };
    valueOf: {
        valueOf: ToValueOf<T>;
    };
};
export type Transform<T, Action extends keyof TransformAble<T>> = TransformAble<
    T
>[Action] &
    T;

export type ExtractKey<T> = Extract<keyof T, string>;

export function toString<T, KEY extends keyof T = ExtractKey<T>>(
    o: T[KEY]
): T[KEY];
export function toString<T extends null | undefined>(o: T): string;
export function toString<T>(o: Transform<T, "toString">): string;
// export function toString(o: any): string;
export function toString(o: any) {
    return o === null ? "null" : o === undefined ? "undefined" : o.toString();
}

export function valueOf<T, KEY extends keyof T = ExtractKey<T>>(
    o: T[KEY]
): T[KEY];
export function valueOf<T>(obj: Transform<T, "valueOf">): T;
export function valueOf(o: null): null;
export function valueOf(o: undefined): undefined;
// export function valueOf(o: any): any;
export function valueOf(o: any): any {
    return o === null ? null : o === undefined ? undefined : o.valueOf();
}
