import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { Release } from './manifest.ts';

export const imageListFile = 'images.txt';

/** One `<image>:<tag>` per line: each managed variant's canonical tag followed by its short tags. */
export function renderImageList(releases: Release[]): string {
  return `${releases.flatMap((release) => [release.tag, ...release.aliasTags].map((tag) => `${release.image}:${tag}`)).join('\n')}\n`;
}

export function readImageList(root: string): string[] {
  return readFileSync(path.join(root, imageListFile), 'utf8').split('\n').map((line) => line.trim()).filter(Boolean);
}

/** Write images.txt from the manifest; check mode fails on drift instead of writing. */
export function syncImageList(root: string, releases: Release[], options: { check?: boolean } = {}) {
  const file = path.join(root, imageListFile);
  const after = renderImageList(releases);
  let before = '';
  try {
    before = readFileSync(file, 'utf8');
  } catch {
    // a missing file is out of date
  }
  const changed = before !== after;
  if (options.check && changed) throw new Error(`${imageListFile} is out of date; run just images`);
  if (!options.check && changed) writeFileSync(file, after);
  return { file: imageListFile, lines: after.trimEnd().split('\n').length, state: options.check ? 'checked' : changed ? 'updated' : 'unchanged' };
}
