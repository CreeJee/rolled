export function __createStore() {
    return {
        $store: new Map(),
    };
}
export function __getStore(obj) {
    if (!("$store" in obj)) {
        throw new Error("this object is not binding $store");
    }
    return obj.$store;
}
export function fromStore(context, findKey, defaultValue) {
    let parent = null;
    while ((parent = context.parent) !== null) {
        if (parent.$store.has(findKey)) {
            return parent.$store.get(findKey) || defaultValue;
        }
    }
    return defaultValue;
}
export function setStore(context, key, value) {
    const $store = __getStore(context);
    if ($store.has(key)) {
        //dev log
        console.warn(`${key} is already exist from $store`);
    }
    $store.set(key, value);
    return value;
}
