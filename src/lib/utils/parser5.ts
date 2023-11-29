import * as parser from "@babel/parser";
import traverse from "@babel/traverse";

function parseAndPrintChildren(tsxCode: string) {
  // Parse the TSX code into an AST
  const ast = parser.parse(tsxCode, {
    sourceType: "module",
    plugins: ["jsx", "typescript"],
  });

  // Traverse the AST
  traverse(ast, {
    JSXElement(path) {
      const openingElement = path.node.openingElement;
      console.log("Element:", openingElement.name.name);
      console.log(openingElement.type);

      if (path.node.children && path.node.children.length > 0) {
        // console.log(path.node.children);
        console.log("  Children:");
        path.node.children.forEach((child, index) => {
          if (child.type === "JSXElement") {
            console.log(`    Child ${index}:`, child.openingElement.name.name);
          } else if (child.type === "JSXText") {
            console.log(`    Child ${index}: Text Node`);
          }
          // Handle other child types if needed (e.g., JSXExpressionContainer)
        });
      } else {
        console.log("  No children");
      }
    },
  });
}

// Example usage
const tsxCode = `
import React from 'react';

const MyComponent = () => (
  <div>
    <span>Hello</span>
    <span>World</span>
  </div>
);

export default MyComponent;
`;

parseAndPrintChildren(tsxCode);
