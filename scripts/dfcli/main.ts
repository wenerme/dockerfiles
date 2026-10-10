#!/usr/bin/env bun
import { buildProgram } from './program.ts';
import { commandError } from './lib/repo.ts';

try {
  await buildProgram().parseAsync(process.argv);
} catch (error) {
  console.error(commandError(error));
  process.exitCode = 1;
}
