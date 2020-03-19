const styleElement = document.createElement("style");
const styleSheet = styleElement.sheet;
styleElement.id = "rolled-style";
document.head.appendChild(styleElement);

const memorizedStyle = new Map();
const memorizedAnim = new Map();

// why using css class like ID?
/**
 * @param {{ [x: string]: any; }} stylesObj
 */
export function styles(stylesObj) {
    for (let selector in stylesObj) {
        const classStyles = stylesObj[selector];
        if (!memorizedStyle.has(selector)) {
            throw new Error(
                `styles already defined object:${JSON.stringify({
                    [selector]: classStyles
                })}`
            );
        }
        const ruleIdx = styleSheet.insertRule(
            `${selector} {}`,
            styleSheet.cssRules.length
        );
        const ruleStyle = styleSheet.cssRules[ruleIdx].style;
        for (let rule in classStyles) {
            if (rule[0] === ":" || rule[0] === " ") {
                const pseudoRuleIdx = styleSheet.insertRule(
                    `${selector}${rule} {}`,
                    styleSheet.cssRules.length
                );
                const pseudoRuleStyle =
                    styleSheet.cssRules[pseudoRuleIdx].style;
                Object.assign(pseudoRuleStyle, classStyles[rule]);
                delete classStyles[rule];
            }
        }

        Object.assign(ruleStyle, classStyles);
        // well...? it does not need :)
        stylesObj[selector] = selector;
    }
    return stylesObj;
}
// TODO : return 맞추기
export function keyframes(framesObj) {
    for (let name in framesObj) {
        const frames = framesObj[name];
        if (!memorizedAnim.has(name)) {
            throw new Error(
                `styles already defined object:${JSON.stringify({
                    [name]: frames
                })}`
            );
        }
        const framesIdx = styleSheet.insertRule(
            `@keyframes ${name} {}`,
            styleSheet.cssRules.length
        );
        const framesSheet = styleSheet.cssRules[framesIdx];

        for (let percent in frames) {
            framesSheet.appendRule(`${percent}% {}`);
            const frameIdx = framesSheet.cssRules.length - 1;
            const frameStyle = framesSheet.cssRules[frameIdx].style;
            Object.assign(frameStyle, frames[percent]);
        }
    }
    return framesObj;
}

export default styles;
