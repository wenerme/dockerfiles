import { describe, expect, test } from 'bun:test';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { projectCommand } from './project.ts';
import { root } from './repo.ts';

function fixture(check: (dir: string) => void) {
  const dir = mkdtempSync(path.join(tmpdir(), 'dfcli-project-'));
  try {
    copyFileSync(path.join(root, 'build.mk'), path.join(dir, 'build.mk'));
    mkdirSync(path.join(dir, 'image group'));
    writeFileSync(path.join(dir, 'image group/docker-bake.hcl'), '');
    check(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

describe('local project actions', () => {
  test('preserves Make build prerequisites and exports the repository Docker configuration', () => fixture((dir) => {
    mkdirSync(path.join(dir, '.docker'));
    mkdirSync(path.join(dir, 'bin'));
    writeFileSync(path.join(dir, 'bin/docker'), '#!/bin/sh\ntest -f prepared || exit 8\nprintf "config=%s args=%s\\n" "$DOCKER_CONFIG" "$*"\n', { mode: 0o755 });
    writeFileSync(path.join(dir, 'image group/Makefile'), 'include $(REPO_ROOT)/build.mk\nbuild: prepare\nprepare:\n\t@touch prepared\n');
    const { cmd, dir: cwd } = projectCommand(dir, 'image group', 'load', ['83'], 'x64');
    const result = Bun.spawnSync([...cmd, 'SOURCE_DATE_EPOCH=0'], {
      cwd, env: { ...process.env, PATH: `${dir}/bin:${process.env.PATH}`, ALPINE_RELEASE: '3.24.1', ALPINE_VERSION: '3.24' },
      stdout: 'pipe', stderr: 'pipe',
    });
    expect(result.exitCode).toBe(0);
    expect(result.stdout.toString()).toContain(`config=${dir}/.docker`);
    expect(result.stdout.toString()).toContain('args=buildx bake --load --set *.platform=linux/amd64 83');
  }));

  test('Bake-only groups use shared Make for push; legacy Make recipes keep precedence', () => fixture((dir) => {
    const fallback = projectCommand(dir, 'image group', 'push', ['image']);
    expect(fallback.cmd).toContain(path.join(dir, 'build.mk'));
    expect(fallback.cmd.at(-1)).toBe('push');
    writeFileSync(path.join(dir, 'image group/Makefile'), '# build.mk is intentionally not included\npush:\n\t@echo custom-push\n');
    const legacy = projectCommand(dir, 'image group', 'push', []);
    const result = Bun.spawnSync([...legacy.cmd, 'SOURCE_DATE_EPOCH=0'], {
      cwd: legacy.dir, env: { ...process.env, ALPINE_RELEASE: '3.24.1', ALPINE_VERSION: '3.24' }, stdout: 'pipe', stderr: 'pipe',
    });
    expect(result.exitCode).toBe(0);
    expect(result.stdout.toString().trim()).toBe('custom-push');
    expect(legacy.cmd.indexOf(path.join(dir, 'build.mk'))).toBeLessThan(legacy.cmd.indexOf('Makefile'));
  }));

  test('rejects shell/Make expansion in target names and paths escaping the repository', () => fixture((dir) => {
    for (const target of ['--push', '$(touch injected)', 'x;touch injected', 'x y', '../image']) {
      expect(() => projectCommand(dir, 'image group', 'push', [target])).toThrow('invalid Bake target');
    }
    expect(() => projectCommand(dir, '..', 'push')).toThrow('inside the repository');
    symlinkSync(tmpdir(), path.join(dir, 'outside'));
    expect(() => projectCommand(dir, 'outside', 'push')).toThrow('inside the repository');
    expect(() => projectCommand(dir, 'image group', 'load', [], 'riscv64')).toThrow('unsupported');
  }));

  test('print keeps JSON stdout clean and dry-run does not execute build preparation', () => fixture((dir) => {
    mkdirSync(path.join(dir, 'bin'));
    writeFileSync(path.join(dir, 'bin/docker'), '#!/bin/sh\nprintf \'{"target":{}}\\n\'\n', { mode: 0o755 });
    writeFileSync(path.join(dir, 'image group/Makefile'), 'include $(REPO_ROOT)/build.mk\nbuild: prepare\nprepare:\n\t@touch prepared\n');
    const env = { ...process.env, PATH: `${dir}/bin:${process.env.PATH}`, ALPINE_RELEASE: '3.24.1', ALPINE_VERSION: '3.24' };
    const print = projectCommand(dir, 'image group', 'print');
    const printed = Bun.spawnSync([...print.cmd, 'SOURCE_DATE_EPOCH=0'], { cwd: print.dir, env, stdout: 'pipe', stderr: 'pipe' });
    expect(printed.exitCode).toBe(0);
    expect(JSON.parse(printed.stdout.toString())).toEqual({ target: {} });
    const load = projectCommand(dir, 'image group', 'load', [], 'arm64');
    const dry = Bun.spawnSync([load.cmd[0], '-n', ...load.cmd.slice(1), 'SOURCE_DATE_EPOCH=0'], { cwd: load.dir, env, stdout: 'pipe', stderr: 'pipe' });
    expect(dry.exitCode).toBe(0);
    expect(dry.stdout.toString()).toContain('touch prepared');
    expect(() => readFileSync(path.join(load.dir, 'prepared'))).toThrow();
  }));

  test('rejects target loss and application-only build recipes before execution', () => fixture((dir) => {
    writeFileSync(path.join(dir, 'image group/Makefile'), 'push:\n\tdocker buildx bake --push\nprint:\n\tdocker buildx bake --print\nbuild:\n\tpnpm next build\n');
    for (const action of ['push', 'print'] as const) {
      expect(() => projectCommand(dir, 'image group', action, ['selected'])).toThrow('must use $(DOCKER_BUILD_BAKE)');
    }
    for (const action of ['build', 'load'] as const) {
      expect(() => projectCommand(dir, 'image group', action)).toThrow('must use $(DOCKER_BUILD_BAKE)');
    }
  }));

  test('custom multi-target and inline recipes receive selected targets', () => fixture((dir) => {
    writeFileSync(path.join(dir, 'image group/Makefile'), 'build push: ; @echo $(DOCKER_BUILD_BAKE)\n');
    for (const action of ['build', 'push'] as const) {
      const command = projectCommand(dir, 'image group', action, ['selected']);
      const result = Bun.spawnSync([...command.cmd, 'SOURCE_DATE_EPOCH=0'], {
        cwd: command.dir, env: { ...process.env, ALPINE_RELEASE: '3.24.1', ALPINE_VERSION: '3.24' }, stdout: 'pipe', stderr: 'pipe',
      });
      expect(result.exitCode).toBe(0);
      expect(result.stdout.toString()).toContain('docker buildx bake selected');
    }
  }));

  test('Next template builds its application before each image action and loads the requested platform', () => fixture((dir) => {
    copyFileSync(path.join(root, 'templates/next-standalone/Makefile'), path.join(dir, 'image group/Makefile'));
    mkdirSync(path.join(dir, '.docker'));
    mkdirSync(path.join(dir, 'bin'));
    writeFileSync(path.join(dir, 'bin/pnpm'), '#!/bin/sh\nprintf "application-build\\n" >> prepared\n', { mode: 0o755 });
    writeFileSync(path.join(dir, 'bin/docker'), '#!/bin/sh\ntest -f prepared || exit 8\nprintf "config=%s args=%s\\n" "$DOCKER_CONFIG" "$*"\n', { mode: 0o755 });
    const env = { ...process.env, PATH: `${dir}/bin:${process.env.PATH}`, ALPINE_RELEASE: '3.24.1', ALPINE_VERSION: '3.24' };
    for (const [index, action] of (['build', 'load', 'push'] as const).entries()) {
      const command = projectCommand(dir, 'image group', action, ['web'], 'x64');
      const result = Bun.spawnSync([...command.cmd, 'SOURCE_DATE_EPOCH=0'], { cwd: command.dir, env, stdout: 'pipe', stderr: 'pipe' });
      expect(result.exitCode).toBe(0);
      expect(result.stdout.toString()).toContain(`config=${dir}/.docker`);
      expect(result.stdout.toString()).toContain('web');
      expect(readFileSync(path.join(command.dir, 'prepared'), 'utf8').trim().split('\n')).toHaveLength(index + 1);
      if (action === 'load') expect(result.stdout.toString()).toContain('--load --set *.platform=linux/amd64');
      if (action === 'push') expect(result.stdout.toString()).toContain('--push');
    }
  }));

  test('Debian custom print and push recipes forward their selected Bake target', () => fixture((dir) => {
    copyFileSync(path.join(root, 'debian/Makefile'), path.join(dir, 'image group/Makefile'));
    mkdirSync(path.join(dir, 'bin'));
    writeFileSync(path.join(dir, 'bin/docker'), '#!/bin/sh\nprintf "args=%s\\n" "$*"\n', { mode: 0o755 });
    for (const action of ['print', 'push'] as const) {
      const command = projectCommand(dir, 'image group', action, ['bookworm-backports']);
      const result = Bun.spawnSync([...command.cmd, 'SOURCE_DATE_EPOCH=0'], {
        cwd: command.dir, env: { ...process.env, PATH: `${dir}/bin:${process.env.PATH}`, ALPINE_RELEASE: '3.24.1', ALPINE_VERSION: '3.24' }, stdout: 'pipe', stderr: 'pipe',
      });
      expect(result.exitCode).toBe(0);
      expect(result.stdout.toString()).toContain(`args=buildx bake bookworm-backports --${action}`);
    }
  }));
});
