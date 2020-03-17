
const styleElement = document.createElement('style');
const styleSheet = styleElement.sheet;
styleElement.id = 'rolled-style';
document.head.appendChild(styleElement)

// function makeid() {
//     const {possible, n} = makeid
//     let alphaHex = n.toString(26).split(''), c, r = ''
//     while(c = alphaHex.shift()) r += possible[parseInt(c, 26)]
//     makeid.n++
//     return r
// };

// makeid.possible = "abcdefghijklmnopqrstuvwxyz"
// makeid.n = 0;


// why using css class like ID? 
export function styles(stylesObj) {
    for(let selector in stylesObj) {
        /**
         * generate empty style
         */
        const ruleIdx = styleSheet.insertRule(`${selector} {}`, styleSheet.cssRules.length)
        const ruleStyle = styleSheet.cssRules[ruleIdx].style;
    
        const classStyles = stylesObj[selector];

        for(let rule in classStyles) {
            if (rule[0] === ':' || rule[0] === ' ') {
                const pseudoRuleIdx = styleSheet.insertRule(`${selector}${rule} {}`, styleSheet.cssRules.length)
                const pseudoRuleStyle = styleSheet.cssRules[pseudoRuleIdx].style
                Object.assign(pseudoRuleStyle, classStyles[rule])
                delete classStyles[rule]
            }
        }
        
        Object.assign(ruleStyle, classStyles);
        // well...? it does not need :)
        stylesObj[selector] = genClass
    }
    return stylesObj;
}
// TODO : return 맞추기
export function keyframes(framesObj) {
    for(let name in framesObj) {
        // humm... it might be need duplicate check or animation name...? maybe? IDK
        
        const framesIdx = styleSheet.insertRule(`@keyframes ${name} {}`, styleSheet.cssRules.length)
        const framesSheet = styleSheet.cssRules[framesIdx]
        
        const frames = framesObj[name]

        for(let percent in frames) {
            framesSheet.appendRule(`${percent}% {}`)
            const frameIdx = framesSheet.cssRules.length - 1
            const frameStyle = framesSheet.cssRules[frameIdx].style
            Object.assign(frameStyle, frames[percent])
        }
    }
    return framesObj;
}

export default styles