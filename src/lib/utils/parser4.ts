import * as parser from "@babel/parser";
import traverse, { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import generate from "@babel/generator";

const code = `
import ImageComponent from "./ImageComponent";

type AsyncComponentProps = {
  pokemonName: string;
};

export async function FetchComponent() {
  const res = await fetch("https://pokeapi.co/api/v2/pokemon/ditto");
  const pokemon = await res.json();

  // take one second
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return (
    <div className="flex flex-col border items-center w-32 p-4 gap-4">
      <img
        src={pokemon.sprites.front_default}
        className="border rounded-full  w-16 h-16"
      />
          <div className="flex flex-col border items-center w-32 p-4 gap-4">
      <img
        src={pokemon.sprites.front_default}
        className="border rounded-full  w-16 h-16"
      />
      <ImageComponent src={pokemon.sprites.front_default} />
    </div>
    </div>
  );
}

export default FetchComponent;

`;

const ast = parser.parse(code, {
  sourceType: "module",
  plugins: ["jsx", "typescript"],
});

let newAst: t.JSXElement | t.JSXFragment | null = null;

function traverseAndExtract(node: t.Node): void {
  traverse(node, {
    JSXElement(path: NodePath<t.JSXElement>) {
      if (!newAst) {
        newAst = path.node; // First JSX element
        console.log("First JSX Element:", newAst);

        // Recursively traverse children of the first JSX element
        traverseChildren(newAst);
      }
    },
  });
}

function traverseChildren(node: t.Node) {
  // Check if the node is a JSXElement
  if (t.isJSXElement(node)) {
    node.children.forEach((child: t.Node) => {
      if (t.isJSXElement(child)) {
        console.log("Child JSX Element:", child);
        traverseChildren(child); // Recursively handle children
      } else if (t.isJSXFragment(child)) {
        // Handle JSXFragment similarly if needed
        traverseChildren(child);
      }
      // Add other node types if necessary
    });
  }
}

traverseAndExtract(ast);

if (newAst) {
  const modifiedCode = generate(newAst).code;
  console.log(modifiedCode);
  console.log(generate(newAst).code);
}
