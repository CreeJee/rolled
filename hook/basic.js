const generateMemoryKey = () => Object.create(null);
const generateStateObject = (context, initValue) => {
    const temp = [null, null];
    let value = initValue;
    Object.defineProperties(temp, {
        0: {
            get: () => value
        },
        1: {
            get: () =>
                function setter(val) {
                    value = val;
                    //dispatch effect protocol
                }
        }
    });
    return temp;
};

export function useState(context, initValue) {
    return generateStateObject(context, initValue);
}
export function useEffect({ render }, onCycle, deps) {
    const effect = () => {
        const unMount = onCycle();
        const unMountEffect = () => {
            unMount();
        };
        hookRef.push(unMountEffect);
        hookRef.splice(hookRef.indexOf(onCycle), 1);
    };
    let hookRef = [];
    hookRef.push(effect);
}
export function bindHook(render) {
    const hookContext = {
        render,
        useState: (value) => useState(hookContext, value),
        useEffect: (...arg) => useEffect(hookContext, ...arg)
    };
    return hookContext;
}
