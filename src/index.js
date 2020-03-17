class Ref {
    constructor(idx, ref) {
        this.idx = idx;
        this.ref = ref;
    }
}

const TREE_WALKER = document.createTreeWalker(
    document,
    NodeFilter.SHOW_ALL,
    null,
    false
);
const compilerTemplate = document.createElement("template");
const collector = (node) => {
    if (node.nodeType !== 3) {
        if (node.attributes !== undefined) {
            for (let attr of Array.from(node.attributes)) {
                let aname = attr.name;
                if (aname[0] === "#") {
                    let rName = aname.slice(1);
                    node.removeAttribute(aname);
                    node.setAttribute(rName, "");
                    return aname.slice(1);
                }
            }
        }
        return 0;
    } else {
        let nodeData = node.nodeValue;
        if (nodeData[0] === "#") {
            node.nodeValue = "";
            return nodeData.slice(1);
        }
        return 0;
    }
};
const genPath = (node) => {
    const w = TREE_WALKER;
    w.currentNode = node;

    let indices = [],
        ref,
        idx = 0;
    do {
        if ((ref = collector(node))) {
            indices.push(new Ref(idx + 1, ref));
            idx = 1;
        } else {
            idx++;
        }
    } while ((node = w.nextNode()));

    return indices;
};

TREE_WALKER.roll = function(n) {
    while (--n) this.nextNode();
    return this.currentNode;
};

function walker(node) {
    const refs = {};
    const w = TREE_WALKER;

    w.currentNode = node;
    for (const x of this._refPaths) {
        const ref = x.ref;
        let rolled = w.roll(x.idx);
        refs[ref] = rolled;
    }
    // this._refPaths.map((x) => (refs[x.ref] = w.roll(x.idx)));
    return refs;
}
export const extractFragment = (strings, ...args) => {
    const template = String.raw(strings, ...args)
        .replace(/>\n+/g, ">")
        .replace(/\s+</g, "<")
        .replace(/>\s+/g, ">")
        .replace(/\n\s+/g, "<!-- -->");
    compilerTemplate.innerHTML = template;
    return compilerTemplate.content;
};
export const compile = (node) => {
    node._refPaths = genPath(node);
    node.collect = walker;
};
export const h = (strings, ...args) => {
    const content = extractFragment(strings, ...args).firstChild;
    compile(content);
    return content;
};
//Fragment
const getSelfPath = (node) => {
    const w = TREE_WALKER;
    const parent = node.parentNode;
    const siblings = parent !== null ? Array.from(parent.childNodes) : [];

    let current = node;
    w.currentNode = node;

    let indices = [],
        ref,
        idx = 0;
    do {
        if ((ref = collector(current))) {
            indices.push(new Ref(idx + 1, ref));
            idx = 1;
        } else {
            idx++;
        }
        //???
        if (!node.isSameNode(current) && siblings.includes(current)) {
            break;
        }
    } while ((current = w.nextNode()));

    return indices;
};
export const fragmentCompile = (node) => {
    for (const self of node.childNodes) {
        self._refPaths = getSelfPath(self);
        self.collect = walker;
    }
};
const fragmentCollect = (node) => {
    const refs = {};
    for (const self of node.childNodes) {
        Object.assign(refs, self.collect(self));
    }
    return refs;
};
export const fragment = (strings, ...args) => {
    const content = extractFragment(strings, ...args);
    fragmentCompile(content);
    content.collect = fragmentCollect;
    return content;
};
export default h;
