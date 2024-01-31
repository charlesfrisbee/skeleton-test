#!/usr/bin/env node
import { Command } from "commander";
import { createSkeletonComponent } from "./core";
import path from "path";
import fs from "fs";

const program = new Command();

program
  .version("1.0.0")
  .description("React component processing tool")
  .option("-i, --input <path>", "Input file path of the React component")
  .option(
    "-o, --output <path>",
    "Output file path for the transformed React component"
  );

program.parse(process.argv);

const options = program.opts();

async function main() {
  if (!options.input || !options.output) {
    console.error("Both input and output options are required.");
    program.help(); // Show program help and exit
  }

  const input = options.input as string;
  const output = options.output as string;

  const skeletonComponent = createSkeletonComponent(input);

  console.log(skeletonComponent);

  const outputFilePath = path.resolve(process.cwd(), output);
  fs.writeFileSync(outputFilePath, skeletonComponent);

  // Use options.input and options.output for further processing
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
