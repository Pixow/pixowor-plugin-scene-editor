import generatePackageJson from "rollup-plugin-generate-package-json";
import copy from "rollup-plugin-copy";
import angular from "rollup-plugin-angular-ivy";
import typescript from 'rollup-plugin-typescript2';
import image from '@rollup/plugin-image';
import sass from "node-sass";
import CleanCSS from "clean-css";
import { minify as minifyHtml } from "html-minifier";
const cssmin = new CleanCSS();
const htmlminOpts = {
  caseSensitive: true,
  collapseWhitespace: true,
  removeComments: true,
};


export default {
  input: "compiler/src/index.js",
  output: {
    file: "dist/index.js",
    format: "system",
  },
  plugins: [
    image(),
    angular({
      replace: false,
      preprocessors: {
        template: (template) => minifyHtml(template, htmlminOpts),
        style: (scss) => {
          const css = sass.renderSync({ data: scss }).css;
          return cssmin.minify(css).styles;
        },
      },
    }),
    typescript(),
    copy({
      targets: [{ src: "src/logo.png", dest: "dist" }],
    }),
    generatePackageJson({
      baseContents: (pkg) => ({
        name: pkg.name,
        description: pkg.description,
        version: pkg.version,
        author: pkg.author,
        icon: pkg.icon,
      }),
      output: "dist",
    }),
  ],
  external: ["@angular/core", "@angular/common", "angular-pluggable", "rxjs", "game-capsule"],
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
