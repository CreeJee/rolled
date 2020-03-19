"use strict";

import * as path from "path";
import babel from "rollup-plugin-babel";
import resolve from "rollup-plugin-node-resolve";
import { terser } from "rollup-plugin-terser";

const plugins = [
    resolve({
        mainFields: ["module", "jsnext"],
        browser: true
    }),
    // minifyliterals({
    //     literals: true
    // }),
    babel({
        exclude: "node_modules/**",
        presets: [["@babel/preset-env"]],
        runtimeHelpers: true,
        babelrc: false
    }),
    terser()
];

const files = [
    "src/index",
    "src/base/keyed",
    "src/base/reconcile",
    "src/base/reuseNodes",
    "src/hook/basic",
    "src/hook/dom",
    "src/hook/index",
    "src/hook/taskQueue",
    "src/styles",
    "src/syntheticEvents"
];

export default files.map((name) => ({
    input: `${name}.js`,
    output: {
        file: `dist/${name}.min.js`,
        format: "umd",
        name: "rolled",
        sourcemap: false,
        exports: "named",
        extend: true
    },
    plugins
}));
