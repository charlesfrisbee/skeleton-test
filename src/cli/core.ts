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

const filePath = "src/components/FetchComponent.tsx";

const allImports = findImports(filePath);
const updatedComponentCode = addImportsToComponent(filePath, allImports);
const originalAst = parseComponentStringToAst(updatedComponentCode);

// recursively traverse AST
traverseAST(originalAst, filePath);

// remove imports from final ast
removeImports(originalAst);

// generate skeleton component from final ast
const skeletonComponent = generateCodeFromAST(originalAst);
console.log(skeletonComponent);

// // write to file
// const outputFilePath = path.resolve(__dirname, "SkeletonComponent.tsx");
// fs.writeFileSync(outputFilePath, newCode);
