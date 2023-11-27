# Skeleton Test

## NOTE: This is a proof of concept and is not intended to be used in production.

This is a test repo to check if it is possible to create a skeleton loading component for a given UI component automatically.
It works by statically analyzing the components using babel to obtain the underlying structure of the component and then generating a skeleton component based on that structure's styles.

## How to use

Run the parse script to generate the skeleton component:

```bash
npx tsx src/lib/utils/parser.ts
```

This will generate a skeleton component for a given component.

## TODO

- [ ] Add CLI argument to specify which component to generate a skeleton for
- [ ] Add CLI argument to specify the output directory
- [ ] Add CLI argument to specify the output file name
- [ ] Use Commander as CLI engine
