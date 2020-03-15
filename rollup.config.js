"use strict";

import * as path from "path";
import babel from "rollup-plugin-babel";
import resolve from "rollup-plugin-node-resolve";
import { terser } from "rollup-plugin-terser";
import minifyliterals from "rollup-plugin-minifyliterals";

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
    "index",
    "base/keyed",
    "base/reconcile",
    "base/reuseNodes",
    "hook/basic",
    "hook/dom",
    "hook/index",
    "hook/taskQueue",
    "styles",
    "syntheticEvents"
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
