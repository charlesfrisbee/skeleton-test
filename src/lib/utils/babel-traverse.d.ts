// babel-traverse.d.ts
declare module "@babel/traverse" {
  import * as t from "@babel/types";

  interface TraverseOptions {
    // Define the properties for TraverseOptions based on your usage
    enter?: (path: t.NodePath) => void;
    exit?: (path: t.NodePath) => void;
    [key: string]: any; // Add other properties as needed
  }

  function traverse(node: t.Node, options: TraverseOptions): void;

  export = traverse;
}
