import { describe, expect, test } from 'bun:test';
import path from 'node:path';
import { buildProgram } from './program.ts';

const main = path.join(import.meta.dir, 'main.ts');

function commandPaths(command = buildProgram(), prefix = ''): string[] {
  return command.commands.flatMap((child) => {
    const name = `${prefix}${child.name()}`;
    return child.commands.length ? commandPaths(child, `${name} `) : [name];
  });
}

describe('dfcli command tree', () => {
  test('exposes the expected commands', () => {
    expect(commandPaths().sort()).toEqual([
      'base check', 'graph', 'manifest bake', 'manifest check', 'plan', 'postgres versions',
      'project build', 'project info', 'project load', 'project print', 'project push',
      'publish', 'readme', 'rev bump', 'scan', 'status',
    ]);
  });

  test('publish rejects option-like selectors before touching any registry', () => {
    const result = Bun.spawnSync([process.execPath, main, 'publish', '--', '--push'], { stdout: 'pipe', stderr: 'pipe' });
    expect(result.exitCode).toBe(1);
    expect(result.stderr.toString()).toContain('invalid image selector "--push"');
  });

  test('unknown commands fail with a suggestion', () => {
    const result = Bun.spawnSync([process.execPath, main, 'stauts'], { stdout: 'pipe', stderr: 'pipe' });
    expect(result.exitCode).not.toBe(0);
    expect(result.stderr.toString()).toContain('status');
  });
});
