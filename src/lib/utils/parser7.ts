import * as parser from "@babel/parser";
import traverse from "@babel/traverse";
import fs from "fs";
import path from "path";

// Define a type for Import Information
type ImportInfo = {
  source: string;
  importedName: string;
};

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

// Function to parse imports from a file
function parseImports(filePath: string | null): ImportInfo[] {
  if (!filePath) {
    return [];
  }

  const content = fs.readFileSync(filePath, "utf-8");
  const ast = parser.parse(content, {
    sourceType: "module",
    plugins: ["jsx", "typescript"],
  });

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

// Usage
const filePath = "src/components/FetchComponent.tsx"; // Update this to your file path
const imports = parseImports(filePath);
console.log(imports);
const newPath = resolveImportPath(imports[0].source, filePath);
const imports2 = parseImports(newPath);
console.log(imports2);
