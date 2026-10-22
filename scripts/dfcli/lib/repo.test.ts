import { describe, expect, test } from 'bun:test';
import { realpath } from 'node:fs/promises';
import { $ } from 'bun';
import { capture, commandError, root, run, trackedFiles, useRepositoryDockerConfig } from './repo.ts';

describe('repo helpers', () => {
  test('root is the repository regardless of cwd', async () => {
    const gitRoot = (await $`git rev-parse --show-toplevel`.cwd(import.meta.dir).quiet().text()).trim();
    expect(await realpath(root)).toBe(await realpath(gitRoot));
    expect(await trackedFiles()).toContain('manifest.yaml');
  });

  test('commandError keeps the meaningful make error, not the generic trailer', async () => {
    const error = await $`make -s --no-print-directory -C ${root}/agent no-such-target`.quiet().then(() => undefined, (err) => err);
    expect(commandError(error)).toContain('No rule to make target');
    const trailer = Object.assign(new Error('Failed with exit code 2'), {
      stderr: Buffer.from('#12 [stage 1/2] RUN apk add\nERROR: bad thing happened\nmake: *** [print] Error 1\n'),
    });
    expect(commandError(trailer)).toBe('Failed with exit code 2: ERROR: bad thing happened');
    expect(commandError('plain')).toBe('plain');
  });

  test('capture reports exit codes, missing commands and timeouts without throwing', async () => {
    expect(await capture(['sh', '-c', 'echo out; echo err >&2; exit 3'])).toEqual({ exitCode: 3, stdout: 'out\n', stderr: 'err\n', timedOut: false });
    expect((await capture(['dfcli-no-such-command'])).exitCode).toBe(127);
    expect((await capture(['sleep', '5'], { timeoutMs: 100 })).timedOut).toBe(true);
    const killed = await capture(['sh', '-c', 'kill -TERM $$'], { timeoutMs: 5_000 });
    expect(killed).toMatchObject({ timedOut: false, signal: 'SIGTERM' });
  });

  test('children see environment changes made after startup, e.g. the repository DOCKER_CONFIG', async () => {
    const previous = process.env.DOCKER_CONFIG;
    try {
      useRepositoryDockerConfig();
      const expected = process.env.DOCKER_CONFIG ?? '';
      expect((await capture(['sh', '-c', 'printf %s "$DOCKER_CONFIG"'])).stdout).toBe(expected);
      process.env.DFCLI_ENV_PROBE = 'live';
      expect((await capture(['sh', '-c', 'printf %s "$DOCKER_CONFIG"'], { env: { DOCKER_CONFIG: '/tmp/override' } })).stdout).toBe('/tmp/override');
      expect((await capture(['sh', '-c', 'printf %s "$DFCLI_ENV_PROBE"'])).stdout).toBe('live');
      await expect(run(['sh', '-c', 'test "$DFCLI_ENV_PROBE" = live'], { timeoutMs: 5_000 })).resolves.toBeUndefined();
    } finally {
      delete process.env.DFCLI_ENV_PROBE;
      if (previous === undefined) delete process.env.DOCKER_CONFIG; else process.env.DOCKER_CONFIG = previous;
    }
  });

  test('run streams to stderr and throws on failure or timeout', async () => {
    await expect(run(['sh', '-c', 'exit 0'], { timeoutMs: 5_000 })).resolves.toBeUndefined();
    await expect(run(['sh', '-c', 'exit 4'], { timeoutMs: 5_000 })).rejects.toThrow('exit code 4');
    await expect(run(['sleep', '5'], { timeoutMs: 100 })).rejects.toThrow('timed out');
    await expect(run(['sh', '-c', 'kill -TERM $$'], { timeoutMs: 5_000 })).rejects.toThrow('terminated by SIGTERM');
    const child = Bun.spawnSync([process.execPath, '-e',
      `import { run } from '${import.meta.dir}/repo.ts'; await run(['sh', '-c', 'echo build-log'], { timeoutMs: 5000 });`],
    { stdout: 'pipe', stderr: 'pipe' });
    expect(child.stdout.toString()).toBe('');
    expect(child.stderr.toString()).toContain('build-log');
  });
});
