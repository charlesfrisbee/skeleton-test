import * as parser from "@babel/parser";
import traverse from "@babel/traverse";
import generate from "@babel/generator";
import * as t from "@babel/types";
import fs from "fs";

// Helper function to read a file and parse it into an AST
function parseFileToAst(filePath: string) {
  const content = fs.readFileSync(filePath, "utf-8");
  return parser.parse(content, {
    sourceType: "module",
    plugins: ["jsx", "typescript"],
  });
}

// Function to extract JSX from ImageComponent
function extractJsxFromImageComponent(filePath: string) {
  const ast = parseFileToAst(filePath);
  let jsxElement = null;

  traverse(ast, {
    ReturnStatement(path) {
      if (path.node.argument && t.isJSXElement(path.node.argument)) {
        jsxElement = path.node.argument;
      }
    },
  });

  return jsxElement;
}

// Function to replace <ImageComponent .../> in FetchComponent
function replaceImageComponentInFetchComponent(
  fetchComponentPath: string,
  imageComponentPath: string
) {
  const fetchComponentAst = parseFileToAst(fetchComponentPath);
  const imageComponentJsx = extractJsxFromImageComponent(imageComponentPath);

  if (!imageComponentJsx) {
    console.error("Could not extract JSX from ImageComponent");
    return;
  }

  traverse(fetchComponentAst, {
    JSXOpeningElement(path) {
      if (path.node.name.name === "ImageComponent") {
        const parentPath = path.findParent((p) => p.isJSXElement());
        if (parentPath && parentPath.node) {
          parentPath.replaceWith(t.cloneNode(imageComponentJsx));
        }
      }
    },
  });

  return generate(fetchComponentAst).code;
}

const fetchComponentPath = "src/components/FetchComponent.tsx";
const imageComponentPath = "src/components/ImageComponent.tsx";
const modifiedFetchComponentCode = replaceImageComponentInFetchComponent(
  fetchComponentPath,
  imageComponentPath
);
console.log(modifiedFetchComponentCode);
