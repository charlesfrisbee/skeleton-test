import * as parser from "@babel/parser";
import traverse from "@babel/traverse";
import fs from "fs";
import path from "path";

// Function to create a skeleton element based on the original element type
const createSkeletonElement = (
  elementType: string,
  originalClassNames: string
): string => {
  // Add the skeleton classes
  const skeletonClasses = "bg-gray-300 animate-pulse";
  const combinedClassNames = `${originalClassNames} ${skeletonClasses}`;

  // Return the transformed element
  return `<div className="${combinedClassNames}"></div>`;
};

// Read the source file
// const filePath = path.resolve(__dirname, "../../components/FetchComponent.tsx");
const sourceCode = fs.readFileSync(
  "src/components/FetchComponent.tsx",
  "utf-8"
);

// Parse the source code into an AST
const ast = parser.parse(sourceCode, {
  sourceType: "module",
  plugins: ["jsx", "typescript"],
});

// Array to store extracted elements
let elements: { elementType: string; classNames: string }[] = [];

// Traverse the AST and extract information from child elements only
traverse(ast, {
  JSXElement(path: any) {
    // Skip the outermost div
    if (path.parentPath.isJSXElement()) {
      const elementType = path.node.openingElement.name.name;
      const classNamesAttr = path.node.openingElement.attributes.find(
        (attr: any) =>
          attr.type === "JSXAttribute" && attr.name.name === "className"
      );
      const classNames =
        classNamesAttr && classNamesAttr.value.type === "StringLiteral"
          ? classNamesAttr.value.value
          : "";

      elements.push({ elementType, classNames });
    }
  },
});

// Generate the skeleton component's JSX
const skeletonJSX = elements
  .map(({ elementType, classNames }) =>
    createSkeletonElement(elementType, classNames)
  )
  .join("\n");

// Final skeleton component code
const skeletonComponentCode = `
import React from "react";

const SkeletonComponent = () => {
  return (
    <div className="flex flex-col border items-center w-32 p-4 gap-4">
      ${skeletonJSX}
    </div>
  );
};

export default SkeletonComponent;
`;

// Optionally, write the output to a file
const outputFilePath = path.resolve(__dirname, "SkeletonComponent.tsx");
fs.writeFileSync(outputFilePath, skeletonComponentCode);

console.log("Skeleton component generated:", outputFilePath);
