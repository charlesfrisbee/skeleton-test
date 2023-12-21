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

function isCustomComponent(elementName: string): boolean {
  return /^[A-Z]/.test(elementName);
}

function parseImports(ast: t.Node): ImportInfo[] {
  const imports: ImportInfo[] = [];

  traverse(ast, {
    ImportDeclaration(path) {
      const source = path.node.source.value; // Path of the import
      path.node.specifiers.forEach((specifier) => {
        const importedName =
          specifier.type === "ImportDefaultSpecifier"
            ? "default"
            : specifier.imported.name;
        imports.push({ source, importedName });
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
  const imports = parseImports(ast);

  traverse(ast, {
    FunctionDeclaration(path) {
      // Remove async keyword from function declaration
      path.node.async = false;

      // Keep only the return statement in the function body (remove everything else from original component)
      const returnStatement = path.node.body.body.find(
        (statement) => statement.type === "ReturnStatement"
      );
      path.node.body.body = [returnStatement];
    },
    JSXOpeningElement(path) {
      const foundElement = imports.find((element) =>
        element.source.includes(path.node.name.name)
      );

      if (isCustomComponent(path.node.name.name) && foundElement) {
        const newPath = resolveImportPath(foundElement.source, filePath);

        if (newPath) {
          let newAst = parseFileToAst(newPath);

          let imageComponentJsx = extractJsxFromImageComponent(newPath);

          const parentPath = path.findParent((p) => p.isJSXElement());

          if (parentPath && parentPath.node) {
            console.log("yes");
            parentPath.replaceWith(t.cloneNode(imageComponentJsx));
          }

          traverseAST(newAst);
        }
      }
    },
  });
}

function addImportsToComponent(mainFilePath, importsToAdd) {
  const ast = parseFileToAst(mainFilePath);
  const existingImports = new Set();
  let lastImportIndex = -1;

  // Gather existing imports and find the index of the last import
  traverse(ast, {
    ImportDeclaration(path) {
      existingImports.add(path.node.source.value);
      lastImportIndex = path.parent.body.indexOf(path.node);
    },
  });

  // Generate import declarations from the set of import paths
  const importDeclarations = Array.from(importsToAdd)
    .map((importPath) => {
      const componentName = getComponentNameFromPath(importPath);
      const relativeImportPath = getRelativeImportPath(
        mainFilePath,
        importPath
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
    ast.program.body.splice(lastImportIndex + 1, 0, ...importDeclarations);
  } else {
    // If there are no existing imports, unshift to the top
    ast.program.body.unshift(...importDeclarations);
  }

  return generate(ast).code;
}

function findImports(
  filePath,
  allImports = new Set(),
  visitedFiles = new Set()
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
      allImports.add(absolutePath);

      if (isCustomComponent(path.node.specifiers[0].local.name)) {
        findImports(absolutePath, allImports, visitedFiles); // Recursive call
      }
    },
  });

  return allImports;
}

function getRelativeImportPath(from, to) {
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

function getComponentNameFromPath(filePath) {
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

traverseAST(originalAst);
const newCode = generate(originalAst).code;
console.log(newCode);
