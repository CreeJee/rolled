const generateEvent = (name) => `__${name}__`;
const nativeToSyntheticEvent = (event, name) => {
    const eventKey = generateEvent(name);
    let dom = event.target;
    while (dom !== null) {
        const eventHandler = dom[eventKey];
        if (eventHandler) {
            eventHandler(event);
            return undefined;
        }
        dom = dom.parentNode;
    }
};
const CONFIGURED_SYNTHETIC_EVENTS = {};
export function addEventListener($dom, name, fn) {
    $dom[generateEvent(name)] = fn;
}
export function setupSyntheticEvent(name) {
    if (name in CONFIGURED_SYNTHETIC_EVENTS) {
        return;
    }
    // TODO : support multiple events
    document.addEventListener(name, (event) =>
        nativeToSyntheticEvent(event, name)
    );
    CONFIGURED_SYNTHETIC_EVENTS[name] = true;
}
