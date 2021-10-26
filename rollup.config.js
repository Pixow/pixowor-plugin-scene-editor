import generatePackageJson from "rollup-plugin-generate-package-json";
import json from "@rollup/plugin-json";
import copy from "rollup-plugin-copy";
import angular from "rollup-plugin-angular-ivy";
import typescript from "rollup-plugin-typescript2";
import sass from "node-sass";
import CleanCSS from "clean-css";
import { minify as minifyHtml } from "html-minifier";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
const cssmin = new CleanCSS();
const htmlminOpts = {
  caseSensitive: true,
  collapseWhitespace: true,
  removeComments: true,
};
const postcss = require("postcss");
const base64 = require("postcss-base64");

export default {
  input: "compiler/src/index.js",
  output: {
    file: "dist/index.js",
    format: "system",
  },
  plugins: [
    nodeResolve(), 
    commonjs(),
    json(),
    angular({
      replace: false,
      preprocessors: {
        template: (template) => minifyHtml(template, htmlminOpts),
        style: (scss) => {
          const css = sass.renderSync({ data: scss }).css;
          const styles = cssmin.minify(css).styles;

          const opts = {
            extensions: [".png", ".svg"], // Replaces png and svg files
            root: __dirname,
          };
          const output = postcss().use(base64(opts)).process(styles).css;

          return output;
        },
      },
    }),
    typescript(),
    generatePackageJson({
      baseContents: (pkg) => ({
        name: pkg.name,
        description: pkg.description,
        version: pkg.version,
        author: pkg.author,
      }),
      output: "dist",
    }),
    copy({
      targets: [{ src: "manifest.json", dest: "dist" }],
    }),
  ],
  external: [
    "@PixelPai/game-core",
    "@angular/core",
    "@angular/common",
    "pixowor-core",
    "rxjs",
    "game-capsule",
  ],
  onwarn: function (warning) {
    if (
      warning.code === "THIS_IS_UNDEFINED" ||
      warning.code === "UNUSED_EXTERNAL_IMPORT"
    ) {
      return;
    }

    console.warn(warning.code, warning.message);
  },
};
