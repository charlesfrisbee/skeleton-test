import _generate from "@babel/generator";
import _traverse from "@babel/traverse";
import * as t from "@babel/types";
import {
  getComponentNameFromPath,
  getRelativeImportPath,
  isCustomComponent,
} from "./helpers";
import { resolveImportPath } from "./fileSystem";
import { hasBody, parseFileToAst } from "../ast/astProcessor";

const traverse = _traverse.default;
const generate = _generate.default;

export function findImports(
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

export function addImportsToComponent(
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

export function removeImports(ast: t.Node) {
  traverse(ast, {
    ImportDeclaration(path) {
      path.remove();
    },
  });
}
