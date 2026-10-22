import { capture, lastErrorLine, run } from './repo.ts';

export type RemoteDigest = { state: 'found'; digest: string } | { state: 'missing' } | { state: 'error'; detail: string };

const notFound = /not found|NAME_UNKNOWN|MANIFEST_UNKNOWN|\b404\b/i;

/** Index digest of a ref; a 404 is a missing tag, anything else is an unknown state. */
export async function regctlDigest(ref: string): Promise<RemoteDigest> {
  const result = await capture(['regctl', 'image', 'digest', ref], { timeoutMs: 120_000 });
  if (result.exitCode === 0 && /^sha256:[a-f0-9]{64}$/.test(result.stdout.trim())) return { state: 'found', digest: result.stdout.trim() };
  if (result.exitCode === 127) return { state: 'error', detail: 'regctl not found; install it from https://github.com/regclient/regclient' };
  if (result.timedOut) return { state: 'error', detail: `regctl timed out for ${ref}` };
  if (notFound.test(result.stderr)) return { state: 'missing' };
  return { state: 'error', detail: lastErrorLine(result.stderr) ?? `regctl failed for ${ref}` };
}

export type RepositoryState = { state: 'exists' } | { state: 'missing' } | { state: 'error'; detail: string };

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

export async function regctlRepository(repository: string): Promise<RepositoryState> {
  return repositoryState(await capture(['regctl', 'tag', 'ls', repository], { timeoutMs: 120_000 }));
}

/** Copy one image (all platforms) by digest; the caller verifies the target digest afterwards. */
export async function regctlCopy(source: string, target: string) {
  await run(['regctl', 'image', 'copy', source, target], { timeoutMs: 60 * 60_000 });
}
