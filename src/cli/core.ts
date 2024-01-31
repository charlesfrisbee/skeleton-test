import path from "path";
import {
  generateCodeFromAST,
  parseComponentStringToAst,
  traverseAST,
} from "./ast/astProcessor";
import {
  addImportsToComponent,
  findImports,
  removeImports,
} from "./utils/importManager";

export function createSkeletonComponent(pathToComponent: string) {
  const allImports = findImports(pathToComponent);
  const updatedComponentCode = addImportsToComponent(
    pathToComponent,
    allImports
  );
  const originalAst = parseComponentStringToAst(updatedComponentCode);

  // recursively traverse AST
  traverseAST(originalAst, pathToComponent);

  // remove imports from final ast
  removeImports(originalAst);

  // generate skeleton component from final ast
  const skeletonComponent = generateCodeFromAST(originalAst);
  //   console.log(skeletonComponent);
  return skeletonComponent;
}

// // write to file
// const outputFilePath = path.resolve(__dirname, "SkeletonComponent.tsx");
// fs.writeFileSync(outputFilePath, newCode);
