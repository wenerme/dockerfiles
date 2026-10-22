import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { capture, lastErrorLine, run } from './repo.ts';

export type RemoteDigest = { state: 'found'; digest: string } | { state: 'missing' } | { state: 'error'; detail: string };

const notFound = /not found|NAME_UNKNOWN|MANIFEST_UNKNOWN|\b404\b/i;

/** Index digest of a ref; a 404 is a missing tag, anything else is an unknown state. Transient errors are retried. */
export async function regctlDigest(ref: string, attempts = 3): Promise<RemoteDigest> {
  let last: RemoteDigest = { state: 'error', detail: `regctl failed for ${ref}` };
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const result = await capture(['regctl', 'image', 'digest', ref], { timeoutMs: 120_000 });
    if (result.exitCode === 0 && /^sha256:[a-f0-9]{64}$/.test(result.stdout.trim())) return { state: 'found', digest: result.stdout.trim() };
    if (result.exitCode === 127) return { state: 'error', detail: 'regctl not found; install it from https://github.com/regclient/regclient' };
    if (!result.timedOut && notFound.test(result.stderr)) return { state: 'missing' };
    last = { state: 'error', detail: result.timedOut ? `regctl timed out for ${ref}` : lastErrorLine(result.stderr) ?? last.detail };
    if (attempt < attempts) await Bun.sleep(2_000 * attempt);
  }
  return last;
}

export type RepositoryState = { state: 'exists' } | { state: 'missing' } | { state: 'private' } | { state: 'error'; detail: string };

/**
 * Classify `regctl tag ls`. Docker Hub answers 404 for a missing repository and Quay answers unauthorized,
 * so both mean "do not push": a push would create a new repository, private on Quay. Anything else is unknown.
 */
export function repositoryState(result: { exitCode: number; stderr: string; timedOut: boolean }): RepositoryState {
  if (result.exitCode === 0) return { state: 'exists' };
  if (result.exitCode === 127) return { state: 'error', detail: 'regctl not found; install it from https://github.com/regclient/regclient' };
  if (result.timedOut) return { state: 'error', detail: 'regctl timed out' };
  if (/NAME_UNKNOWN|\b404\b|unauthorized/i.test(result.stderr)) return { state: 'missing' };
  return { state: 'error', detail: lastErrorLine(result.stderr) ?? `regctl exited with ${result.exitCode}` };
}

/**
 * Whether a sync target can receive tags. A repository readable with the repository credentials but not anonymously
 * is private; pushing there would publish nothing, so it is reported like a missing one.
 */
export async function regctlRepository(repository: string): Promise<RepositoryState> {
  const authed = repositoryState(await capture(['regctl', 'tag', 'ls', repository], { timeoutMs: 120_000 }));
  if (authed.state !== 'exists') return authed;
  const anonymous = mkdtempSync(path.join(tmpdir(), 'dfcli-anonymous-'));
  try {
    const result = await capture(['regctl', 'tag', 'ls', repository], { timeoutMs: 120_000, env: { DOCKER_CONFIG: anonymous } });
    const state = repositoryState(result);
    return state.state === 'exists' ? state : state.state === 'missing' ? { state: 'private' } : state;
  } finally {
    rmSync(anonymous, { recursive: true, force: true });
  }
}

/** Copy one image (all platforms) by digest; the caller verifies the target digest afterwards. */
export async function regctlCopy(source: string, target: string) {
  await run(['regctl', 'image', 'copy', source, target], { timeoutMs: 60 * 60_000 });
}
