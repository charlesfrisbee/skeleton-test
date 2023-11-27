import * as parser from "@babel/parser";
import traverse, { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import fs from "fs";
import path from "path";

function readFileContent(filePath: string): string {
  return fs.readFileSync(filePath, "utf-8");
}

function parseFile(filePath: string) {
  const content = readFileContent(filePath);
  return parser.parse(content, {
    sourceType: "module",
    plugins: ["jsx", "typescript"],
  });
}

function isCustomComponent(elementName: string): boolean {
  return /^[A-Z]/.test(elementName);
}

function extractClassNamesFromElement(element: t.JSXElement): string {
  for (const attribute of element.openingElement.attributes) {
    if (t.isJSXAttribute(attribute) && attribute.name.name === "className") {
      if (t.isStringLiteral(attribute.value)) {
        return attribute.value.value; // For string literals
      } else if (
        t.isJSXExpressionContainer(attribute.value) &&
        t.isStringLiteral(attribute.value.expression)
      ) {
        return attribute.value.expression.value; // For expressions containing string literals
      }
      // Additional handling can be added here for other types of className expressions
    }
  }
  return ""; // Return empty string if no className attribute is found
}

function resolveImportPath(
  importPath: string,
  currentFile: string
): string | null {
  // Skip Node module imports (anything not starting with '.' or '/')
  if (!importPath.startsWith(".") && !importPath.startsWith("/")) {
    return null;
  }

  const baseDir = path.dirname(currentFile);
  const possibleExtensions = ["", ".tsx", ".ts", ".jsx", ".js"];

  for (let ext of possibleExtensions) {
    const fullPath = path.resolve(baseDir, `${importPath}${ext}`);
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
  }
  throw new Error(
    `Cannot resolve path for import '${importPath}' in file '${currentFile}'`
  );
}

function traverseComponent(
  ast: t.File,
  currentFilePath: string,
  parsedComponents = new Set<string>()
) {
  const elements: Array<{ elementType: string; classNames: string }> = [];

  if (parsedComponents.has(currentFilePath)) {
    return elements; // Skip if this component has already been parsed
  }
  parsedComponents.add(currentFilePath);

  traverse(ast, {
    ImportDeclaration(path: any) {
      const sourcePath = path.node.source.value;
      const resolvedPath = resolveImportPath(sourcePath, currentFilePath);

      if (resolvedPath && !parsedComponents.has(resolvedPath)) {
        const importedAst = parseFile(resolvedPath);
        elements.push(
          ...traverseComponent(importedAst, resolvedPath, parsedComponents)
        );
      }
    },
    JSXElement(path: any) {
      const openingElement = path.node.openingElement;
      const elementType = openingElement.name.name;

      if (isCustomComponent(elementType)) {
        // Directly resolve the path of the custom component
        const resolvedPath = resolveImportPath(
          `./${elementType}`,
          currentFilePath
        );
        if (resolvedPath && !parsedComponents.has(resolvedPath)) {
          const importedAst = parseFile(resolvedPath);
          elements.push(
            ...traverseComponent(importedAst, resolvedPath, parsedComponents)
          );
        }
      } else {
        const classNames = extractClassNamesFromElement(path.node);
        elements.push({ elementType, classNames });
      }
    },
  });

  return elements;
}

const mainFilePath = "src/components/FetchComponent.tsx";
const mainAst = parseFile(mainFilePath);
const elements = traverseComponent(mainAst, mainFilePath, new Set());
console.log(elements);

type ElementData = {
  elementType: string;
  classNames: string;
  children?: ElementData[];
};

function createSkeletonElement(element: ElementData): string {
  const skeletonClass = "bg-gray-300 animate-pulse";
  const classNames = `${element.classNames} ${skeletonClass}`;

  let childrenJSX = "";
  if (element.children && element.children.length > 0) {
    childrenJSX = element.children.map(createSkeletonElement).join("\n");
  }

  return `<${element.elementType} className="${classNames}">${childrenJSX}</${element.elementType}>`;
}

// Assuming 'elements' is an array of ElementData representing the hierarchy of your component
const skeletonJSX = elements.map(createSkeletonElement).join("\n");

const skeletonComponent = `
import React from 'react';

const SkeletonComponent = () => {
  return (
    ${skeletonJSX}
  );
};

export default SkeletonComponent;
`;

console.log(skeletonComponent);
