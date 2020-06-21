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
import { IStore } from "../util";
//but is it really 
type StoreAddons<StoreType, Extra> = { $store: IStore<StoreType> } & Extra;
type BaseStoreComponent<StoreType> = StoreAddons<StoreType, IBaseComponent>;
type StoredComponent<
    StoreType,
    Component
> = StoreAddons<
    StoreType,
    InferComponent<Component>
>;

// recursive type checking use infer
export function fromStore<
    StoreType,
    Component extends IBaseComponent
>(
    component: StoredComponent<
        StoreType,
        Component
    >,
    findKey: string,
    defaultValue: StoreType
) {
    let self: BaseStoreComponent<StoreType> = component;
    let item = defaultValue;
    do {
        const $store = self.$store;
        if ($store.get(findKey)) {
            item = $store.get(findKey);
            break;
        }
    } while (
        (self = component.parent as BaseStoreComponent<StoreType>) !== null
    );
    return item;
}