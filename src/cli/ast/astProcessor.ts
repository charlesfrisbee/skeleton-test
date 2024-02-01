import * as parser from "@babel/parser";
import traverse from "@babel/traverse";
import * as t from "@babel/types";
import fs from "fs";
import { isCustomComponent } from "../utils/helpers";
import { resolveImportPath } from "../utils/fileSystem";
import { ImportInfo } from "../types";
import generate from "@babel/generator";

export function parseFileToAst(filePath: string) {
  const content = fs.readFileSync(filePath, "utf-8");
  return parseComponentStringToAst(content);
}

export function parseComponentStringToAst(content: string) {
  return parser.parse(content, {
    sourceType: "module",
    plugins: ["jsx", "typescript"],
  });
}

function extractJsxFromImageComponent(filePath: string) {
  const ast = parseFileToAst(filePath);
  let jsxElement: t.JSXElement | null = null;

  traverse(ast, {
    ReturnStatement(path) {
      if (path.node.argument && t.isJSXElement(path.node.argument)) {
        jsxElement = path.node.argument;
      }
    },
  });

  return jsxElement;
}

function needsTransformation(expression: t.Expression) {
  // This example criterion checks if the expression is something other than
  // a simple literal or identifier, suggesting it might be more complex or
  // could benefit from being explicitly returned in a block statement for clarity.
  // Adjust the logic here based on your specific transformation needs.

  // Return true if the expression is complex enough to warrant being wrapped in a block statement
  // For simplicity, we consider anything other than a literal or identifier as complex.
  // You can add more conditions here based on the types of expressions you want to transform.
  return !["Literal", "Identifier"].includes(expression.type);
}

export function traverseAST(ast: t.Node, filePath: string) {
  const imports = parseImports(ast); // Assuming parseImports is defined elsewhere

  traverse(ast, {
    FunctionDeclaration(path) {
      // Remove async keyword from function declaration
      path.node.async = false;

      // Keep only the return statement in the function body
      const returnStatement = path.node.body.body.find(
        (statement) => statement.type === "ReturnStatement"
      );

      if (returnStatement) {
        path.node.body.body = [returnStatement];
      }
    },
    ArrowFunctionExpression(path) {
      // Remove async keyword from function declaration
      if (path.node.async) {
        path.node.async = false;
      }

      // Check if the body is a BlockStatement to access its body array
      if (path.node.body.type === "BlockStatement") {
        const returnStatement = path.node.body.body.find(
          (statement) => statement.type === "ReturnStatement"
        );

        if (returnStatement) {
          path.node.body.body = [returnStatement];
        }
      } else {
        // Handle the case where the body is an Expression
        // For an arrow function with an expression body, you might need to convert it to a BlockStatement
        // if you need to ensure it only returns a specific statement or modify its return expression.
        // This example shows how to wrap the existing expression in a BlockStatement with a return statement,
        // but only do this if necessary for your transformation logic.

        // Check if it's necessary to transform the expression into a return statement within a BlockStatement
        if (needsTransformation(path.node.body)) {
          path.node.body = t.blockStatement([
            t.returnStatement(path.node.body),
          ]);
        }
      }
    },

    JSXExpressionContainer(path) {
      if (
        t.isCallExpression(path.node.expression) && // Check if it's a call expression
        t.isMemberExpression(path.node.expression.callee) && // Ensure the callee is a member expression
        t.isIdentifier(path.node.expression.callee.property, { name: "map" }) // Check if the property is 'map'
      ) {
        const callback = path.node.expression.arguments[0]; // Get the callback function of the .map
        if (
          t.isArrowFunctionExpression(callback) ||
          t.isFunctionExpression(callback)
        ) {
          const body = callback.body;
          if (t.isBlockStatement(body)) {
            // If the body of the callback is a block statement, look for a return statement
            const returnStatement = body.body.find((statement) =>
              t.isReturnStatement(statement)
            );
            if (returnStatement && returnStatement.argument) {
              // If a return statement is found, replace the JSXExpressionContainer with its argument
              path.replaceWith(returnStatement.argument);
            }
          } else if (t.isJSXElement(body) || t.isJSXFragment(body)) {
            // If the body of the callback is directly a JSXElement or JSXFragment, replace directly
            path.replaceWith(body);
          }
        }
      } else {
        // Replace the JSXExpressionContainer with an empty JSXText node
        path.replaceWith(t.jSXText(`&nbsp;`));
      }
    },
    JSXOpeningElement(path) {
      const additionalClasses = "animate-pulse rounded-md bg-gray-300";

      // Check if the element has children that are text or JSX expressions and not JSX elements
      // @ts-ignore
      const hasNonElementChildren = path.parentPath.node.children.every(
        // @ts-ignore
        (child) =>
          t.isJSXText(child) ||
          (t.isJSXExpressionContainer(child) &&
            !t.isJSXElement(child.expression))
      );

      if (hasNonElementChildren) {
        const classNameAttribute = path.node.attributes.find(
          (attr) => t.isJSXAttribute(attr) && attr.name.name === "className"
        );

        if (
          classNameAttribute &&
          t.isJSXAttribute(classNameAttribute) &&
          t.isStringLiteral(classNameAttribute.value)
        ) {
          // Append to existing className
          classNameAttribute.value.value += ` ${additionalClasses}`;
        } else {
          // Add new className attribute
          const newClassNameAttribute = t.jsxAttribute(
            t.jsxIdentifier("className"),
            t.stringLiteral(additionalClasses)
          );
          path.node.attributes.push(newClassNameAttribute);
        }
      }

      const attributes = path.node.attributes;
      const classNameAttribute = attributes.find(
        (attr) => t.isJSXAttribute(attr) && attr.name.name === "className"
      );

      path.node.attributes = classNameAttribute ? [classNameAttribute] : [];

      let jsxElementName: string | undefined; // Explicitly declaring the type of 'name'

      if (t.isJSXIdentifier(path.node.name)) {
        jsxElementName = path.node.name.name;
      } else if (t.isJSXMemberExpression(path.node.name)) {
        // Handle JSXMemberExpression if needed
        // For example, name = path.node.name.property.name;
      }

      // Ensure 'name' is not undefined before using it
      if (jsxElementName) {
        const foundElement = imports.find((element) =>
          element.source.includes(jsxElementName as string)
        );

        if (isCustomComponent(jsxElementName) && foundElement) {
          const newPath = resolveImportPath(foundElement.source, filePath); // filePath should be defined

          if (newPath) {
            let newAst = parseFileToAst(newPath); // Assuming parseFileToAst is defined

            let imageComponentJsx = extractJsxFromImageComponent(newPath); // Assuming this function is defined
            if (imageComponentJsx) {
              const parentPath = path.findParent((p) => p.isJSXElement());

              if (parentPath && parentPath.node) {
                parentPath.replaceWith(t.cloneNode(imageComponentJsx, false)); // cloneNode(node, deep)
              }

              traverseAST(newAst, filePath); // Recursively call traverseAST
            }
          }
        }
      }
    },
  });
}

function parseImports(ast: t.Node): ImportInfo[] {
  const imports: ImportInfo[] = [];

  traverse(ast, {
    ImportDeclaration(path) {
      const source = path.node.source.value; // Path of the import
      path.node.specifiers.forEach((specifier) => {
        if (specifier.type === "ImportSpecifier") {
          // Check if 'imported' is an Identifier
          if (t.isIdentifier(specifier.imported)) {
            const importedName = specifier.imported.name;
            imports.push({ source, importedName });
          }
        } else if (specifier.type === "ImportDefaultSpecifier") {
          // Handle default imports
          imports.push({ source, importedName: "default" });
        } else if (specifier.type === "ImportNamespaceSpecifier") {
          // Handle namespace imports
          imports.push({ source, importedName: "*" });
        }
      });
    },
  });

  return imports;
}

export function hasBody(node: t.Node): node is t.Program | t.BlockStatement {
  return "body" in node && Array.isArray((node as any).body);
}

export function generateCodeFromAST(ast: t.Node) {
  return generate(ast).code;
}
