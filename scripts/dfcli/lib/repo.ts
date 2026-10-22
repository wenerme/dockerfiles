import { existsSync } from 'node:fs';
import path from 'node:path';
import { $ } from 'bun';

/** Repository root, independent of the caller's working directory. */
export const root = path.resolve(import.meta.dir, '../../..');

// Bun.spawn snapshots the environment at startup; pass the live one so settings such as DOCKER_CONFIG reach children.
const childEnv = () => ({ ...process.env });

/** Same rule as build.mk: registry credentials come from the repository Docker config when it exists. */
export function useRepositoryDockerConfig() {
  const dir = path.join(root, '.docker');
  if (existsSync(dir)) process.env.DOCKER_CONFIG = dir;
}

export function rel(file: string) {
  return path.relative(root, file) || '.';
}

/** Tracked files only, so local scratch files cannot change generated output or CI checks. */
export async function trackedFiles(): Promise<string[]> {
  return (await $`git ls-files`.cwd(root).quiet().text()).split('\n').filter(Boolean);
}

export async function sourceRevision(): Promise<string | undefined> {
  const revision = process.env.GITHUB_SHA ?? (await $`git rev-parse HEAD`.cwd(root).quiet().text()).trim();
  return /^[a-f0-9]{40}$/.test(revision) ? revision : undefined;
}

export interface Captured {
  exitCode: number;
  stdout: string;
  stderr: string;
  timedOut: boolean;
  /** Signal that terminated the process, e.g. SIGTERM; set for both timeouts and external kills. */
  signal?: string;
}

// Bun reports the kill signal but not why it was sent; a signal at or past the deadline means our timeout fired.
function killedByTimeout(signal: string | null, startedAt: number, timeoutMs?: number) {
  return signal !== null && timeoutMs !== undefined && performance.now() - startedAt >= timeoutMs * 0.95;
}

/**
 * Run a command with a timeout and capture its output without throwing.
 * Bun Shell has no per-command timeout, so registry queries that may hang use Bun.spawn.
 */
export async function capture(cmd: string[], options: { cwd?: string; timeoutMs?: number } = {}): Promise<Captured> {
  let proc: Bun.Subprocess<'ignore', 'pipe', 'pipe'>;
  const startedAt = performance.now();
  try {
    proc = Bun.spawn(cmd, { cwd: options.cwd, env: childEnv(), stdin: 'ignore', stdout: 'pipe', stderr: 'pipe', timeout: options.timeoutMs });
  } catch (error) {
    return { exitCode: 127, stdout: '', stderr: error instanceof Error ? error.message : String(error), timedOut: false };
  }
  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);
  const signal = proc.signalCode ?? undefined;
  return { exitCode, stdout, stderr, timedOut: killedByTimeout(proc.signalCode, startedAt, options.timeoutMs), ...(signal ? { signal } : {}) };
}

/**
 * Run a long command with its output streamed to stderr (stdout stays a clean result channel), with a timeout.
 * Throws on a non-zero exit, a timeout, or termination by a signal.
 */
export async function run(cmd: string[], options: { cwd?: string; timeoutMs: number }): Promise<void> {
  const label = cmd.slice(0, 3).join(' ');
  const startedAt = performance.now();
  const proc = Bun.spawn(cmd, { cwd: options.cwd, env: childEnv(), stdin: 'ignore', stdout: 2, stderr: 2, timeout: options.timeoutMs });
  const exitCode = await proc.exited;
  if (killedByTimeout(proc.signalCode, startedAt, options.timeoutMs)) throw new Error(`${label} timed out after ${options.timeoutMs / 1000}s`);
  if (proc.signalCode !== null) throw new Error(`${label} was terminated by ${proc.signalCode}`);
  if (exitCode !== 0) throw new Error(`${label} failed with exit code ${exitCode}`);
}

/** Last meaningful stderr line: skips BuildKit progress (#12 ...) and make's generic "make: *** [x] Error N" trailer. */
export function lastErrorLine(stderr: string): string | undefined {
  return stderr.split('\n').map((line) => line.trim())
    .filter((line) => line && !/^#\d+ /.test(line) && !/^make(\[\d+\])?: \*\*\* \[.*\] Error \d+/.test(line)).at(-1);
}

/** Readable message for a failed Bun Shell command. */
export function commandError(error: unknown): string {
  if (!(error instanceof Error)) return String(error);
  const detail = lastErrorLine((error as Error & { stderr?: Buffer }).stderr?.toString() ?? '');
  return detail ? `${error.message}: ${detail}` : error.message;
}
