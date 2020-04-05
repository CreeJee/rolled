class Ref {
    constructor(idx, ref) {
        this.idx = idx;
        this.ref = ref;
    }
}
export const classListNodeType = "classList";
const attributeClassTable = {
    update(value) {
        const current = this.classList.item(this.nth);
        if (current.length > 0) {
            this.classList.replace(current, value);
        } else {
            this.classList.add(value);
            this.nth = this.classList.length - 1;
        }
    },
    nodeType: classListNodeType,
};
const createClassAttribute = (classList, nth) =>
    Object.assign(Object.create(null), { classList, nth }, attributeClassTable);
const TREE_WALKER = document.createTreeWalker(
    document,
    NodeFilter.SHOW_ALL,
    null,
    false
);
const compilerTemplate = document.createElement("template");
const attributeSymbol = Symbol("@@ATTRIBUTE_SYMBOL");
const collector = (node) => {
    const refSet = [];
    if (node.nodeType !== Node.TEXT_NODE) {
        const attribute = node.attributes;
        const size = attribute.length;
        if (attribute !== undefined) {
            for (let index = 0; index < size; index++) {
                const { name, value } = attribute[index];
                const valueMapper =
                    name === "class" ? value.split(" ") : [value];
                if (name[0] === "#") {
                    let rName = name.slice(1);
                    node.removeAttribute(name);
                    // todo: legacy & remove
                    node.setAttribute(rName, "");
                    refSet.push(name.slice(1));
                }
                for (let index = 0; index < valueMapper.length; index++) {
                    const mappedValue = valueMapper[index];
                    if (mappedValue[0] === "#") {
                        // captured
                        refSet.push(
                            Object.assign(mappedValue.slice(1), {
                                nth: index,
                                name,
                            })
                        );
                    }
                }
                // TODO: attribute mapper
            }
        }
    } else {
        const nodeData = node.nodeValue;
        if (nodeData[0] === "#") {
            node.nodeValue = "";
            refSet.push(nodeData.slice(1));
        }
    }
    return refSet;
};
const generateWay = (indices, node, idx) => {
    const ref = collector(node);
    if (Array.isArray(ref) && ref.length > 0) {
        for (let index = 0; index < ref.length; index++) {
            let obj = ref[index];
            if (index === 1) {
                idx = 0;
            }
            indices.push(new Ref(idx, obj));
        }
        idx = 1;
    } else {
        idx++;
    }
    return idx;
};
const genPath = (node) => {
    const w = TREE_WALKER;
    w.currentNode = node;

    let indices = [],
        idx = 0;
    do {
        idx = generateWay(indices, node, idx);
    } while ((node = w.nextNode()));
    return indices;
};

TREE_WALKER.roll = function (n) {
    while (n > 0) {
        this.nextNode();
        --n;
    }
    return this.currentNode;
};

function walker(node = this) {
    const refs = {};
    const w = TREE_WALKER;
    w.currentNode = node;
    for (const x of this._refPaths) {
        const ref = x.ref;
        const idx = x.idx;
        const rolled = w.roll(idx);
        refs[ref] =
            typeof ref === "object"
                ? ref.name === "class"
                    ? createClassAttribute(rolled.classList, ref.nth)
                    : rolled.attributes[ref.name]
                : rolled;
    }
    // this._refPaths.map((x) => (refs[x.ref] = w.roll(x.idx)));
    return refs;
}
export const extractFragment = (strings, ...args) => {
    const template = String.raw(strings, ...args)
        .replace(/>\n+/g, ">")
        .replace(/\s+</g, "<")
        .replace(/>\s+/g, ">");
    // .replace(/\n\s+/g, "<!-- -->");
    compilerTemplate.innerHTML = template;
    return compilerTemplate.content;
};
const compile = (node) => {
    node._refPaths = genPath(node);
    node.collect = walker;
};
export const h = (strings, ...args) => {
    const content = extractFragment(strings, ...args).firstChild;
    compile(content);
    return content;
};
//Fragment
const genSelfPath = (node) => {
    const w = TREE_WALKER;
    const parent = node.parentNode;
    const siblings = parent !== null ? Array.from(parent.childNodes) : [];

    let current = node;
    w.currentNode = node;

    let indices = [],
        idx = 0;
    do {
        idx = generateWay(indices, current, idx);
        //fragment bugs
        if (!node.isSameNode(current) && siblings.includes(current)) {
            break;
        }
    } while ((current = w.nextNode()));

    return indices;
};
const fragmentCompile = (node) => {
    for (const self of node.childNodes) {
        self._refPaths = genSelfPath(self);
        self.collect = walker;
    }
};
const fragmentCollect = function (node = this) {
    const refs = {};
    for (const self of node.childNodes) {
        Object.assign(refs, self.collect(self));
    }
    return refs;
};
export const fragment = (strings, ...args) => {
    const content = extractFragment(strings, ...args);
    fragmentCompile(content);
    content.collect = fragmentCollect.bind({
        childNodes: Array.from(content.childNodes),
    });
    return content;
};
export default h;
