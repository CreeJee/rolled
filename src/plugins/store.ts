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
// type PropSearch<
//     Component,
//     PropName,
//     StoreType
// > = PropName extends keyof InferComponent<Component>["props"]
//     ? InferComponent<Component>["props"][PropName] extends StoreType
//         ? StoreType
//         : never
//     : never;
// type RecursiveTypeSearch<Component, PropName, StoreType> = {
//     0: Component;
//     1: InferComponent<Component>["parent"] extends null
//         ? never
//         : RecursiveTypeSearch<
//               InferComponent<Component>["parent"],
//               PropName,
//               StoreType
//           >;
// }[PropSearch<Component, PropName, StoreType> extends never ? 1 : 0];

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
