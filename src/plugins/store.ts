import {
    BaseComponent,
    MaybeBaseComponent,
    IBaseComponent,
    InferComponent,
    Component,
    ComponentPlugin,
} from "../hook/component";
import { IStore, Maybe } from "../util";
//but is it really
type StoreAddons<StoreType> = { $store: IStore<StoreType> };
type StoreComponent<StoreType, Component> = ComponentPlugin<
    StoreAddons<StoreType>,
    Component
>;
// recursive type checking use infer
export function fromStore<StoreType, Component, Key extends keyof StoreType>(
    hookContext: Maybe<StoreComponent<StoreType, Component>>,
    findKey: Key,
    defaultValue: StoreType[Key]
): StoreType[Key] {
    if (hookContext !== null) {
        const $store = hookContext.$store;
        const val = $store.get(findKey);
        return val
            ? val
            : fromStore<
                  StoreType,
                  InferComponent<Component>["parent"] extends null
                      ? null
                      : StoreComponent<
                            StoreType,
                            InferComponent<Component>["parent"]
                        >,
                  Key
              >(
                  hookContext.parent as StoreComponent<
                      StoreType,
                      typeof hookContext.parent
                  >,
                  findKey,
                  defaultValue
              );
    }
    return defaultValue;
}
