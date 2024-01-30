import * as parser from "@babel/parser";
import traverse from "@babel/traverse";
import fs from "fs";
import path from "path";
import * as t from "@babel/types";
import generate from "@babel/generator";

type ImportInfo = {
  source: string;
  importedName: string;
};

function parseFileToAst(filePath: string) {
  const content = fs.readFileSync(filePath, "utf-8");
  return parser.parse(content, {
    sourceType: "module",
    plugins: ["jsx", "typescript"],
  });
}

function removeImports(ast: t.Node) {
  traverse(ast, {
    ImportDeclaration(path) {
      path.remove();
    },
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

function isCustomComponent(elementName: string): boolean {
  return /^[A-Z]/.test(elementName);
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
      console.log("fullPath", fullPath);
      return fullPath;
    }
  }
  throw new Error(
    `Cannot resolve path for import '${importPath}' in file '${currentFile}'`
  );
}

function traverseAST(ast: t.Node) {
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
      path.replaceWith(t.jSXText(""));
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
                console.log("yes");
                parentPath.replaceWith(t.cloneNode(imageComponentJsx, false)); // cloneNode(node, deep)
              }

              traverseAST(newAst); // Recursively call traverseAST
            }
          }
        }
      }
    },
  });
}

function hasBody(node: t.Node): node is t.Program | t.BlockStatement {
  return "body" in node && Array.isArray((node as any).body);
}

function addImportsToComponent(
  mainFilePath: string,
  importsToAdd: Set<string>
) {
  const ast = parseFileToAst(mainFilePath);
  const existingImports = new Set();
  let lastImportIndex = -1;

  // Gather existing imports and find the index of the last import
  traverse(ast, {
    ImportDeclaration(path) {
      existingImports.add(path.node.source.value);
      if (hasBody(path.parent)) {
        lastImportIndex = path.parent.body.indexOf(path.node);
      }
    },
  });

  // Generate import declarations from the set of import paths
  const importDeclarations = Array.from(importsToAdd)
    .map((importPath) => {
      const componentName = getComponentNameFromPath(importPath.toString());
      const relativeImportPath = getRelativeImportPath(
        mainFilePath,
        importPath.toString()
      );

      if (!existingImports.has(relativeImportPath)) {
        existingImports.add(relativeImportPath);
        return t.importDeclaration(
          [t.importDefaultSpecifier(t.identifier(componentName))],
          t.stringLiteral(relativeImportPath)
        );
      }
      return null;
    })
    .filter(Boolean); // Filter out nulls (already existing imports)

  // Insert new imports after the last existing import
  if (lastImportIndex !== -1) {
    ast.program.body.splice(
      lastImportIndex + 1,
      0,
      ...(importDeclarations as t.Statement[])
    );
  } else {
    // If there are no existing imports, unshift to the top
    ast.program.body.unshift(...(importDeclarations as t.Statement[]));
  }

  return generate(ast).code;
}

function findImports(
  filePath: string,
  allImports = new Set<string>(),
  visitedFiles = new Set<string>()
) {
  if (visitedFiles.has(filePath)) {
    return allImports;
  }

  const ast = parseFileToAst(filePath);
  visitedFiles.add(filePath);

  traverse(ast, {
    ImportDeclaration(path) {
      const sourcePath = path.node.source.value;
      if (!sourcePath.startsWith(".")) {
        // Skip node_modules imports or any non-relative imports
        return;
      }

      const absolutePath = resolveImportPath(sourcePath, filePath);
      allImports.add(absolutePath as string);

      if (
        isCustomComponent(path.node.specifiers[0].local.name) &&
        absolutePath
      ) {
        findImports(absolutePath, allImports, visitedFiles); // Recursive call
      }
    },
  });

  return allImports;
}

function getRelativeImportPath(from: string, to: string) {
  let relativePath = path.relative(path.dirname(from), path.dirname(to));
  if (!relativePath.startsWith(".") && !relativePath.startsWith("..")) {
    relativePath = "./" + relativePath;
  }
  if (relativePath === ".") {
    relativePath = "./";
  }
  const parsedPath = path.parse(to);
  return "./" + path.join(relativePath, parsedPath.name).replace(/\\/g, "/");
}

function getComponentNameFromPath(filePath: string) {
  const baseName = path.basename(filePath);
  return baseName.split(".")[0];
}

// Code execution starts here
const filePath = "src/components/FetchComponent.tsx";

const allImports = findImports(filePath);
const updatedComponentCode = addImportsToComponent(filePath, allImports);

// parse original component to get AST
const originalAst = parser.parse(updatedComponentCode, {
  sourceType: "module",
  plugins: ["jsx", "typescript"],
});

// recursively traverse AST
traverseAST(originalAst);

// remove imports from final ast
removeImports(originalAst);

// generate code from final ast
const newCode = generate(originalAst).code;
console.log(newCode);

// write to file
const outputFilePath = path.resolve(__dirname, "SkeletonComponent.tsx");
fs.writeFileSync(outputFilePath, newCode);
