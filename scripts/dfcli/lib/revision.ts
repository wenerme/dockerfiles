import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { findImage, resolvedBaseImages, type ImageInfo } from './bake-scan.ts';
import { capture, rel, root } from './repo.ts';

interface BaseDigestState {
  images: Record<string, { baseImages: Record<string, string>; updatedAt?: string }>;
}

function findRevisionVariable(info: ImageInfo, explicit?: string) {
  if (explicit) return explicit;
  return ['REV', 'PG_REVISION'].find((key) => info.variables[key] && /^\d+$/.test(info.variables[key]));
}

/** Increment the numeric revision default in the image's docker-bake.hcl; only writes with write=true. */
export function bumpRevision(info: ImageInfo, options: { variable?: string; write: boolean }) {
  const variable = findRevisionVariable(info, options.variable);
  if (!variable) throw new Error(`no numeric revision variable found for ${info.name}; expected REV or PG_REVISION`);
  const file = path.join(root, info.bakePath);
  const text = readFileSync(file, 'utf8');
  const re = new RegExp(`(variable\\s+"?${variable}"?\\s*\\{[\\s\\S]*?default\\s*=\\s*")(\\d+)("[\\s\\S]*?\\})`);
  const match = re.exec(text);
  if (!match) throw new Error(`could not locate default value for ${variable} in ${info.bakePath}`);
  const before = Number(match[2]);
  const after = before + 1;
  if (options.write) writeFileSync(file, text.replace(re, `$1${after}$3`));
  return { variable, before, after, wrote: options.write };
}

async function inspectImageDigest(image: string) {
  const result = await capture(['docker', 'buildx', 'imagetools', 'inspect', '--format', '{{json .}}', image], { timeoutMs: 60_000 });
  if (result.exitCode !== 0) throw new Error(`inspect ${image} failed: ${result.timedOut ? 'timed out' : result.stderr.trim().split('\n').at(-1)}`);
  const digest = JSON.parse(result.stdout)?.manifest?.digest;
  if (typeof digest !== 'string') throw new Error(`missing digest for ${image}`);
  return digest;
}

/**
 * Compare upstream base image digests against recorded state.
 * A missing record only establishes a baseline; a changed recorded digest bumps the revision (with bump and write).
 */
export async function checkBaseDigests(
  images: ImageInfo[],
  imageRef: string,
  options: { write?: boolean; bump?: boolean; state?: string; revVar?: string },
) {
  const info = findImage(images, imageRef);
  if (!info) throw new Error(`unknown image: ${imageRef}`);
  const statePath = path.join(root, options.state || '.github/image-base-digests.json');
  const write = Boolean(options.write);
  const bases = resolvedBaseImages(info);
  const state: BaseDigestState = existsSync(statePath) ? JSON.parse(readFileSync(statePath, 'utf8')) : { images: {} };
  const previous = state.images[info.name]?.baseImages || {};
  const current: Record<string, string> = {};
  for (const base of bases) current[base] = await inspectImageDigest(base);

  const changed = bases.filter((base) => previous[base] && previous[base] !== current[base]);
  const added = bases.filter((base) => !previous[base]);
  const removed = Object.keys(previous).filter((base) => !current[base]);
  const bump = changed.length && options.bump ? bumpRevision(info, { variable: options.revVar, write }) : undefined;
  const stateWritten = write && (changed.length > 0 || added.length > 0 || removed.length > 0 || !state.images[info.name]);
  if (stateWritten) {
    state.images[info.name] = { baseImages: current, updatedAt: new Date().toISOString() };
    writeFileSync(statePath, `${JSON.stringify(state, null, 2)}\n`);
  }
  return { image: info.name, bases, changed, added, removed, bump, writeRequested: write, stateWritten, state: rel(statePath) };
}
