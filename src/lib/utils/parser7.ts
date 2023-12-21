import * as parser from "@babel/parser";
import traverse from "@babel/traverse";
import * as t from "@babel/types";
import generate from "@babel/generator";
import fs from "fs";
import path from "path";

function parseFileToAst(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  return parser.parse(content, {
    sourceType: "module",
    plugins: ["jsx", "typescript"],
  });
}

function getComponentNameFromPath(filePath) {
  const baseName = path.basename(filePath);
  return baseName.split(".")[0];
}

function isCustomComponent(elementName) {
  return /^[A-Z]/.test(elementName);
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

// ... rest of the code remains the same

function resolveImportPath(importPath, currentFilePath) {
  const dirName = path.dirname(currentFilePath);
  const possibleExtensions = [".js", ".jsx", ".ts", ".tsx"];
  for (const ext of possibleExtensions) {
    const fullPath = path.join(dirName, `${importPath}${ext}`);
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
  }
  throw new Error(
    `Cannot find module '${importPath}' from '${currentFilePath}'`
  );
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

// Replace with the actual path of your main component
const mainComponentPath = "src/components/FetchComponent.tsx";
const allImports = findImports(mainComponentPath);
const updatedComponentCode = addImportsToComponent(
  mainComponentPath,
  allImports
);

console.log(updatedComponentCode);
