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
    JSXExpressionContainer(path) {
      // Replace the JSXExpressionContainer with an empty JSXText node
      path.replaceWith(t.jSXText(`&nbsp;`));
    },
    JSXOpeningElement(path) {
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
