import { existsSync, readFileSync, realpathSync } from 'node:fs';
import path from 'node:path';
import { capture, lastErrorLine, run } from './repo.ts';

export type ProjectAction = 'build' | 'load' | 'push' | 'print' | 'info';

/** Literal public Make goals, including multi-target rules and inline recipes. */
function makeRecipes(source: string) {
  const recipes = new Map<string, string>();
  let goals: string[] = [];
  let firstLine = true;
  for (const line of source.split('\n')) {
    if (line.startsWith('\t')) {
      for (const goal of goals) recipes.set(goal, `${firstLine ? '' : recipes.get(goal) ?? ''}${line}\n`);
      firstLine = false;
    } else if (!/^\s*(?:#.*)?$/.test(line)) {
      const rule = /^([a-zA-Z0-9_. -]+)\s*:(?!=)[^;\n]*(?:;(.*))?$/.exec(line);
      goals = rule?.[1]?.trim().split(/\s+/) ?? [];
      for (const goal of goals) if (!recipes.has(goal)) recipes.set(goal, '');
      firstLine = true;
      if (rule?.[2]?.trim()) {
        for (const goal of goals) recipes.set(goal, `${rule[2]}\n`);
        firstLine = false;
      }
    }
  }
  return recipes;
}

/** All local actions go through Make, including Bake-only directories. */
export function projectCommand(root: string, directory: string, action: ProjectAction, targets: string[] = [], arch = process.arch) {
  const dir = realpathSync(path.resolve(root, directory));
  const relative = path.relative(realpathSync(root), dir);
  if (relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    throw new Error('project directory must be inside the repository');
  }
  if (!existsSync(path.join(dir, 'docker-bake.hcl'))) throw new Error(`${directory}: missing docker-bake.hcl`);
  for (const target of targets) {
    if (!/^[a-zA-Z0-9_][a-zA-Z0-9_.-]*$/.test(target)) throw new Error(`invalid Bake target ${JSON.stringify(target)}`);
  }
  const makefile = path.join(dir, 'Makefile');
  const source = existsSync(makefile) ? readFileSync(makefile, 'utf8') : '';
  const recipes = makeRecipes(source);
  const imageGoal = { build: 'image-build', load: 'image-load', push: 'image-push', print: 'image-ls', info: 'image-info' }[action];
  const goal = recipes.has(imageGoal) ? imageGoal : action === 'load' ? 'build' : action;
  const recipe = recipes.get(goal);
  if (recipe && (targets.length > 0 || action === 'load' || action === 'build') && !/\$\(DOCKER_BUILD_BAKE\)|\$\{DOCKER_BUILD_BAKE\}/.test(recipe)) {
    throw new Error(`${directory}: Make recipe ${goal} must use $(DOCKER_BUILD_BAKE) to support target selection and image building/loading`);
  }
  const cmd = ['make', '--no-print-directory'];
  if (action === 'print' || action === 'info') cmd.push('-s');
  // Supply missing standard goals without overriding a directory's custom recipes or prerequisites.
  if (!source || !/^\s*-?include\s+[^\n]*build\.mk\s*$/m.test(source)) {
    cmd.push('-f', path.join(root, 'build.mk'));
    if (existsSync(makefile)) cmd.push('-f', 'Makefile');
  }
  const bake = ['docker', 'buildx', 'bake'];
  if (action === 'load') {
    const platform = arch === 'x64' ? 'amd64' : arch === 'arm64' ? 'arm64' : undefined;
    if (!platform) throw new Error(`local image loading is unsupported on ${arch}; use project build`);
    bake.push('--load', '--set', `'*.platform=linux/${platform}'`);
  }
  bake.push(...targets);
  cmd.push(`REPO_ROOT=${root}`, `DOCKER_BUILD_BAKE=${bake.join(' ')}`, goal);
  return { cmd, dir };
}

export async function runProject(root: string, directory: string, action: ProjectAction, targets: string[], options: { dryRun?: boolean } = {}) {
  const { cmd, dir } = projectCommand(root, directory, action, targets);
  if (options.dryRun) cmd.splice(1, 0, '-n');
  if (action === 'print' || action === 'info' || options.dryRun) {
    const result = await capture(cmd, { cwd: dir, timeoutMs: 30_000 });
    if (result.timedOut) throw new Error(`${directory}: make ${action} timed out`);
    if (result.exitCode !== 0) throw new Error(lastErrorLine(result.stderr) ?? `make ${action} failed`);
    process.stdout.write(result.stdout);
  } else {
    await run(cmd, { cwd: dir, timeoutMs: 4 * 60 * 60_000 });
  }
}
