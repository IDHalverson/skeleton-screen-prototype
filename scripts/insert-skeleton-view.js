#!/usr/bin/env node

const fsOriginal = require("fs");
const fs = require("fs-extra");
const UglifyJS = require("uglify-js");
const babel = require("@babel/core");

const INDEX_FILE = "./public/index.html";
const BASE_INDEX_FILE = "./public/base-index.html";
const SKELETON_VIEW_FOLDER = "./public/skeleton-view";
const CSS_FILE = `${SKELETON_VIEW_FOLDER}/skeleton-view.css`;
const HTML_FILE = `${SKELETON_VIEW_FOLDER}/skeleton-view.html`;
const JS_FILE = `${SKELETON_VIEW_FOLDER}/skeleton-view.js`;
const CONSTANTS_FILE = `${SKELETON_VIEW_FOLDER}/constants.js`;

/**
 * ABSTRACTED FUNCTIONS
 */

const checkFileExists = (filepath) =>
  new Promise((resolve) =>
    fsOriginal.access(filepath, fsOriginal.constants.F_OK, (error) =>
      resolve(!error)
    )
  );

const prepareAllFileContents = async () => {
  const finalIndexExists = await checkFileExists(INDEX_FILE);
  const [
    baseIndexContentsRaw,
    finalIndexContentsRaw,
    stylesRaw,
    markupRaw,
    scriptRaw,
  ] = await Promise.all([
    fs.readFile(BASE_INDEX_FILE),
    finalIndexExists && fs.readFile(INDEX_FILE),
    fs.readFile(CSS_FILE),
    fs.readFile(HTML_FILE),
    fs.readFile(JS_FILE),
  ]);
  const [styles, markup, script] = [stylesRaw, markupRaw, scriptRaw].map((it) =>
    it.toString()
  );
  const baseIndexContents = baseIndexContentsRaw.toString();
  const finalIndexContents = finalIndexContentsRaw.toString();
  return [styles, markup, script, baseIndexContents, finalIndexContents];
};

/**
 * FINAL / HIGH LEVEL SCRIPT
 */
const insertSkeletonView = async () => {
  console.log("Inserting skeleton view...");
  try {
    const [styles, markup, script, baseIndexContents, finalIndexContents] =
      await prepareAllFileContents();

    /**
     * Parse the JS constants into a usable object.
     */
    const jsConstantsFileContents = (
      await fs.readFile(CONSTANTS_FILE)
    ).toString();
    const constantsObject = eval(jsConstantsFileContents);
    const constantKeys = Object.keys(constantsObject);

    /**
     * Read the raw constants file and insert the constants in place of their key in the JS,
     * then minify/uglify the entire JS script in preparation for the next step.
     */
    let codeWithConstants = script;
    const jsConstantsFileContentsWithoutComments = jsConstantsFileContents
      .replace(/\s?\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, "")
      .replace(/\n\n/g, "\n");
    while (codeWithConstants.includes("CONSTANTS.")) {
      constantKeys.forEach((constantKey, constantKeyIndex) => {
        let constantAsString;
        if (!constantKeys[constantKeyIndex + 1]) {
          constantAsString = jsConstantsFileContentsWithoutComments
            .match(new RegExp(`${constantKey}: ([\\s\\S]+)`))[1]
            .replace(/,?([\s]+)?\}\);\s*$/, "");
        } else {
          constantAsString = jsConstantsFileContentsWithoutComments.match(
            new RegExp(
              `${constantKey}: ([\\s\\S]+),\\n\\s+${
                constantKeys[constantKeyIndex + 1]
              }`
            )
          )[1];
        }
        // Example: in the raw script, replacing CONSTANTS.MY_CONST with '.some-selector'
        codeWithConstants = codeWithConstants.replace(
          new RegExp(`CONSTANTS\.\s*${constantKey}`, "g"),
          constantAsString
        );
      });
    }
    const codeAsES5Obj = babel.transformSync(codeWithConstants, {
      presets: [
        [
          "@babel/preset-env",
          {
            ignoreBrowserslistConfig: true,
            targets: "",
          },
        ],
      ],
    });
    const minifiedCodeObj = UglifyJS.minify(codeAsES5Obj.code, {
      toplevel: true,
      compress: {
        dead_code: true,
      },
    });
    if (minifiedCodeObj.error) {
      console.log(minifiedCodeObj.error);
    }
    const minifiedCode = minifiedCodeObj.code;

    /**
     * For each banner, insert markup and <style> from the skeleton view files.
     * Uglify the skeleton view JcontentS code, insert the constants object, then write it to a <script> tag.
     */
    // Insert markup
    let content = baseIndexContents;
    content = content.split("<body>");
    (content[2] = content[1]) &&
      (content[1] = `<body>\n\t\t${markup.replace(/\n/g, "\n\t\t")}`);
    content = content.join("");

    // Insert javascript
    content = content.split("<head>");
    (content[2] = content[1]) &&
      (content[1] = `<head>\n\t\t<script>${minifiedCode}</script>`);
    content = content.join("");

    // Insert styles
    content = content.split("<head>");
    (content[2] = content[1]) &&
      (content[1] = `<head>\n\t\t<style>\n\t\t\t${styles
        .replace(/\n/g, "\n\t\t\t")
        .replace(/\t$/, "")}</style>`);
    content = content.join("");

    if (finalIndexContents !== content) {
      await fs.writeFile(INDEX_FILE, content);
    }
  } catch (error) {
    console.log(error);
  }
};

insertSkeletonView();
