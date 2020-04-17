// Picked from
// https://github.com/adamhaile/surplus/blob/master/src/runtime/content.ts#L368

export const fragmentTemplate = document.createDocumentFragment();
// return an array of the indices of ns that comprise the longest increasing subsequence within ns
export function longestPositiveIncreasingSubsequence(ns, newStart) {
    var seq = [],
        is = [],
        l = -1,
        pre = new Array(ns.length);

    for (var i = newStart, len = ns.length; i < len; i++) {
        var n = ns[i];
        if (n < 0) continue;
        var j = findGreatestIndexLEQ(seq, n);
        if (j !== -1) pre[i] = is[j];
        if (j === l) {
            l++;
            seq[l] = n;
            is[l] = i;
        } else if (n < seq[j + 1]) {
            seq[j + 1] = n;
            is[j + 1] = i;
        }
    }

    for (i = is[l]; l >= 0; i = pre[i], l--) {
        seq[l] = i;
    }

    return seq;
}

function findGreatestIndexLEQ(seq, n) {
    // invariant: lo is guaranteed to be index of a value <= n, hi to be >
    // therefore, they actually start out of range: (-1, last + 1)
    var lo = -1,
        hi = seq.length;

    // fast path for simple increasing sequences
    if (hi > 0 && seq[hi - 1] <= n) return hi - 1;

    while (hi - lo > 1) {
        var mid = Math.floor((lo + hi) / 2);
        if (seq[mid] > n) {
            hi = mid;
        } else {
            lo = mid;
        }
    }

    return lo;
}
// just for utils
export const noOpUpdate = (a, b) => {};
