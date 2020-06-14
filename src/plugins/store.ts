// export function __createStore() {
//     return {
//         $store: new Map(),
//     };
// }
// export function __getStore(obj) {
//     if (!("$store" in obj)) {
//         throw new Error("this object is not binding $store");
//     }
//     return obj.$store;
// }

import {
    BaseComponent,
    MaybeBaseComponent,
    IBaseComponent,
    InferComponent,
} from "../hook/component";
interface IStore<T> extends Map<keyof T, any> {}
type StoreAddons<StoreType, Extra> = { $store: IStore<StoreType> } & Extra;
type BaseStoreComponent<StoreType> = StoreAddons<StoreType, IBaseComponent>;
type StoredComponent<
    StoreType,
    Component
> = StoreAddons<
    StoreType,
    InferComponent<Component>
>;
export function fromStore<
    StoreType,
    Component extends IBaseComponent
>(
    component: StoredComponent<
        StoreType,
        Component
    >,
    findKey: keyof StoreType,
    defaultValue: StoreType
) {
    let self: BaseStoreComponent<StoreType> = component;
    let item = defaultValue;
    do {
        const $store = self.$store;
        if ($store.has(findKey)) {
            item = $store.get(findKey);
            break;
        }
    } while (
        (self = component.parent as BaseStoreComponent<StoreType>) !== null
    );
    return item;
}
//TODO: Store을 언어기능단위의 무언가로 바꾸자....
// 에바다...

// export function setStore(context, key, value) {
//     const $store = __getStore(context);
//     if ($store.has(key)) {
//         //dev log
//         console.warn(`${key} is already exist from $store`);
//     }
//     $store.set(key, value);
//     return value;
// }
