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
      'base check', 'graph', 'images', 'manifest bake', 'manifest bump', 'manifest check', 'plan', 'postgres versions',
      'project build', 'project info', 'project load', 'project print', 'project push',
      'publish', 'readme', 'rev bump', 'scan', 'status', 'sync', 'update',
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

  test('sync keeps image arguments after a repeated --to and validates targets before any registry access', () => {
    const run = (...args: string[]) => Bun.spawnSync([process.execPath, main, 'sync', ...args], { stdout: 'pipe', stderr: 'pipe' });
    const unmatched = run('--to', 'docker.io/wener', 'no-such-image', '--to', 'quay.io/wener');
    expect(unmatched.exitCode).toBe(1);
    expect(unmatched.stderr.toString()).toContain('no images.txt line matches no-such-image');
    const badTarget = run('php', '--to', 'docker.io/wener', '--to', 'not-a-namespace');
    expect(badTarget.exitCode).toBe(1);
    expect(badTarget.stderr.toString()).toContain('got not-a-namespace');
  });
});
