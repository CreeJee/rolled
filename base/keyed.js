import { noOpUpdate, longestPositiveIncreasingSubsequence } from "../utils.js";

// This is almost straightforward implementation of reconcillation algorithm
// based on ivi documentation:
// https://github.com/localvoid/ivi/blob/2c81ead934b9128e092cc2a5ef2d3cabc73cb5dd/packages/ivi/src/vdom/implementation.ts#L1366
// With some fast paths from Surplus implementation:
// https://github.com/adamhaile/surplus/blob/master/src/runtime/content.ts#L86
//
// How this implementation differs from others, is that it's working with data directly,
// without maintaining nodes arrays, and uses dom props firstChild/lastChild/nextSibling
// for markers moving.
export function keyed(
    key,
    parent,
    renderedValues,
    data,
    createFn,
    noOp = noOpUpdate,
    beforeNode,
    afterNode
) {
    // Fast path for clear
    if (data.length === 0) {
        if (beforeNode !== undefined || afterNode !== undefined) {
            let node =
                    beforeNode !== undefined
                        ? beforeNode.nextSibling
                        : parent.firstChild,
                tmp;

            if (afterNode === undefined) afterNode = null;

            while (node !== afterNode) {
                tmp = node.nextSibling;
                parent.removeChild(node);
                node = tmp;
            }
        } else {
            parent.textContent = "";
        }
        return;
    }

    // Fast path for create
    if (renderedValues.length === 0) {
        let node,
            mode = afterNode !== undefined ? 1 : 0;
        for (let i = 0, len = data.length; i < len; i++) {
            node = createFn(data[i]);
            mode
                ? parent.insertBefore(node, afterNode)
                : parent.appendChild(node);
        }
        return;
    }

    let prevStart = 0,
        newStart = 0,
        loop = true,
        prevEnd = renderedValues.length - 1,
        newEnd = data.length - 1,
        a,
        b,
        prevStartNode = beforeNode ? beforeNode.nextSibling : parent.firstChild,
        newStartNode = prevStartNode,
        prevEndNode = afterNode ? afterNode.previousSibling : parent.lastChild;

    fixes: while (loop) {
        loop = false;
        let _node;

        // Skip prefix
        (a = renderedValues[prevStart]), (b = data[newStart]);
        while (a[key] === b[key]) {
            noOp(prevStartNode, b);
            prevStart++;
            newStart++;
            newStartNode = prevStartNode = prevStartNode.nextSibling;
            if (prevEnd < prevStart || newEnd < newStart) break fixes;
            a = renderedValues[prevStart];
            b = data[newStart];
        }

        // Skip suffix
        (a = renderedValues[prevEnd]), (b = data[newEnd]);
        while (a[key] === b[key]) {
            noOp(prevEndNode, b);
            prevEnd--;
            newEnd--;
            afterNode = prevEndNode;
            prevEndNode = prevEndNode.previousSibling;
            if (prevEnd < prevStart || newEnd < newStart) break fixes;
            a = renderedValues[prevEnd];
            b = data[newEnd];
        }

        // Fast path to swap backward
        (a = renderedValues[prevEnd]), (b = data[newStart]);
        while (a[key] === b[key]) {
            loop = true;
            noOp(prevEndNode, b);
            _node = prevEndNode.previousSibling;
            parent.insertBefore(prevEndNode, newStartNode);
            prevEndNode = _node;
            newStart++;
            prevEnd--;
            if (prevEnd < prevStart || newEnd < newStart) break fixes;
            a = renderedValues[prevEnd];
            b = data[newStart];
        }

        // Fast path to swap forward
        (a = renderedValues[prevStart]), (b = data[newEnd]);
        while (a[key] === b[key]) {
            loop = true;
            noOp(prevStartNode, b);
            _node = prevStartNode.nextSibling;
            parent.insertBefore(prevStartNode, afterNode);
            prevStart++;
            afterNode = prevStartNode;
            prevStartNode = _node;
            newEnd--;
            if (prevEnd < prevStart || newEnd < newStart) break fixes;
            a = renderedValues[prevStart];
            b = data[newEnd];
        }
    }

    // Fast path for shrink
    if (newEnd < newStart) {
        if (prevStart <= prevEnd) {
            let next;
            while (prevStart <= prevEnd) {
                if (prevEnd === 0) {
                    parent.removeChild(prevEndNode);
                } else {
                    next = prevEndNode.previousSibling;
                    parent.removeChild(prevEndNode);
                    prevEndNode = next;
                }
                prevEnd--;
            }
        }
        return;
    }

    // Fast path for add
    if (prevEnd < prevStart) {
        if (newStart <= newEnd) {
            let node,
                mode = afterNode ? 1 : 0;
            while (newStart <= newEnd) {
                node = createFn(data[newStart]);
                mode
                    ? parent.insertBefore(node, afterNode)
                    : parent.appendChild(node);
                newStart++;
            }
        }
        return;
    }

    // Positions for reusing nodes from current DOM state
    const P = new Array(newEnd + 1 - newStart);
    for (let i = newStart; i <= newEnd; i++) P[i] = -1;

    // Index to resolve position from current to new
    const I = new Map();
    for (let i = newStart; i <= newEnd; i++) I.set(data[i][key], i);

    let reusingNodes = newStart + data.length - 1 - newEnd,
        toRemove = [];

    for (let i = prevStart; i <= prevEnd; i++) {
        if (I.has(renderedValues[i][key])) {
            P[I.get(renderedValues[i][key])] = i;
            reusingNodes++;
        } else {
            toRemove.push(i);
        }
    }

    // Fast path for full replace
    if (reusingNodes === 0) {
        if (beforeNode !== undefined || afterNode !== undefined) {
            let node =
                    beforeNode !== undefined
                        ? beforeNode.nextSibling
                        : parent.firstChild,
                tmp;

            if (afterNode === undefined) afterNode = null;

            while (node !== afterNode) {
                tmp = node.nextSibling;
                parent.removeChild(node);
                node = tmp;
                prevStart++;
            }
        } else {
            parent.textContent = "";
        }

        let node,
            mode = afterNode ? 1 : 0;
        for (let i = newStart; i <= newEnd; i++) {
            node = createFn(data[i]);
            mode
                ? parent.insertBefore(node, afterNode)
                : parent.appendChild(node);
        }

        return;
    }

    // What else?
    const longestSeq = longestPositiveIncreasingSubsequence(P, newStart);

    // Collect nodes to work with them
    const nodes = [];
    let tmpC = prevStartNode;
    for (let i = prevStart; i <= prevEnd; i++) {
        nodes[i] = tmpC;
        tmpC = tmpC.nextSibling;
    }

    for (let i = 0; i < toRemove.length; i++)
        parent.removeChild(nodes[toRemove[i]]);

    let lisIdx = longestSeq.length - 1,
        tmpD;
    for (let i = newEnd; i >= newStart; i--) {
        if (longestSeq[lisIdx] === i) {
            afterNode = nodes[P[longestSeq[lisIdx]]];
            noOp(afterNode, data[i]);
            lisIdx--;
        } else {
            if (P[i] === -1) {
                tmpD = createFn(data[i]);
            } else {
                tmpD = nodes[P[i]];
                noOp(tmpD, data[i]);
            }
            parent.insertBefore(tmpD, afterNode);
            afterNode = tmpD;
        }
    }
}

export default keyed;
