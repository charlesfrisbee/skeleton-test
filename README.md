# Skeleton Test

## NOTE: This is a proof of concept and is not intended to be used in production.

This is a test repo to check if it is possible to create a skeleton loading component for a given UI component automatically.
It works by statically analyzing the components using babel to obtain the underlying structure of the component and then generating a skeleton component based on that structure's styles.

## How to use

Run the parse script to generate the skeleton component:

```bash
npx tsx src/lib/utils/parser.ts
```

## Assumptions

In order for it to work, the following assumptions are made:

- div elements may only contain other html elements as children, and are not allowed to contain text nodes.
- All other elements may contain text nodes as children and as a result will be given a height value if they do not already have one.

This will generate a skeleton component for a given component.

## Known issues

- if there are several functions in the input component, the parser will not be able to determine which function is the render function and will output more than one, which is not what we want. Need to add in a check for the default export and use that as the render function. Potentially as a first pass of the ast.
- if there is any text as the child of a component that is not within a JSX Expression, it will not be removed
- not able to handle map functions that return JSX elements. This is because the map function is contained within a JSX Expression and the parser is not able to determine that the map function is returning JSX elements. Need to check each jsx expression to see if it is a map function and then parse the children of the map function.
- if a comment is within a JSX Expression, it will be replaced with a &nbsp; character. Need to add a check to see if the child is a comment and if so remove it.
- need to add a width tailwind class to elements which do not contain widths.

## TODO

- [x] Add CLI argument to specify which component to generate a skeleton for
- [x] Add CLI argument to specify the output directory
- [x] Add CLI argument to specify the output file name
- [x] Use Commander as CLI engine
