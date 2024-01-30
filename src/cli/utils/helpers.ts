import path from "path";

export function getRelativeImportPath(from: string, to: string) {
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

export function getComponentNameFromPath(filePath: string) {
  const baseName = path.basename(filePath);
  return baseName.split(".")[0];
}

export function isCustomComponent(elementName: string): boolean {
  return /^[A-Z]/.test(elementName);
}
