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

const compilerTemplate = document.createElement("template");
const __templateStore = new Map();
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

const __default__handler = () => false;
const genPathRecursive = (
    node,
    handler = __default__handler,
    path = [],
    indices = [],
    root = node
) => {
    const childNodes = node.childNodes;
    const collect = collector(node);
    if (Array.isArray(collect) && collect.length > 0) {
        for (let index = 0; index < collect.length; index++) {
            indices.push(new Ref(path, collect[index]));
        }
    }
    for (const idx of childNodes.keys()) {
        const child = childNodes[idx];
        genPathRecursive(child, handler, path.concat(idx), indices, node);
        if (handler() || __default__handler()) {
            break;
        }
    }
    return indices;
};
const genPath = (node, handler = __default__handler) => {
    return genPathRecursive(node, handler);
};
const genFragmentPath = (node) => {
    const parent = node.parentNode;
    const siblings = parent !== null ? Array.from(parent.childNodes) : [];
    return genPath(
        node,
        () => !node.isSameNode(node) && siblings.includes(node)
    );
};
const roll = (node, idx) => {
    for (const k of idx) {
        node = node.childNodes[k];
    }
    return node;
};

function walker(node = this) {
    const refs = {};
    for (const x of this._refPaths) {
        const ref = x.ref;
        const idx = x.idx;
        const rolled = roll(node, idx);
        refs[ref] =
            typeof ref === "object"
                ? ref.name === "class"
                    ? createClassAttribute(rolled.classList, ref.nth)
                    : rolled.attributes[ref.name]
                : rolled;
    }
    return refs;
}
export const extractFragment = (strings, ...args) => {
    const template = String.raw(strings, ...args)
        .replace(/>\n+/g, ">")
        .replace(/\s+</g, "<")
        .replace(/>\s+/g, ">")
        .replace(/\n\s+/g, "");
    // .replace(/\n\s+/g, "<!-- -->");
    if (__templateStore.has(template)) {
        return __templateStore.get(template).cloneNode(true);
    } else {
        compilerTemplate.innerHTML = template;
        const contentFragment = compilerTemplate.content;
        __templateStore.set(template, contentFragment.cloneNode(true));
        return contentFragment;
    }
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

const fragmentCompile = (node) => {
    for (const self of node.childNodes) {
        self._refPaths = genFragmentPath(self);
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
