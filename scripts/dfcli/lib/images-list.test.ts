import { describe, expect, test } from 'bun:test';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { renderImageList, syncImageList } from './images-list.ts';
import { loadReleases, parseManifest, resolveManifest } from './manifest.ts';
import { root } from './repo.ts';

describe('images.txt', () => {
  test('lists every canonical tag followed by its short tags, one per line', () => {
    const releases = resolveManifest(parseManifest(`schema: 1
registry: ghcr.io/wenerme/dockerfiles
source: https://github.com/wenerme/dockerfiles
images:
  - name: php
    variants:
      - name: "8.4"
        build: { dir: php, target: "84", variables: { app: V, alpine: A, revision: R } }
        version: { scheme: app-alpine, app: "8.4.27-r0", alpine: "3.24.2", revision: 0 }
        aliases: ["8.4", "8.4-alpine-\${alpine}"]
        track: { apk: php84 }
`));
    expect(renderImageList(releases)).toBe('php:8.4-8.4.27-r0-alpine-3.24.2-r0\nphp:8.4\nphp:8.4-alpine-3.24.2\n');
  });

  test('check mode reports drift without writing and the repository file is current', () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'dfcli-images-'));
    try {
      const releases = loadReleases(root);
      writeFileSync(path.join(dir, 'images.txt'), 'stale\n');
      expect(() => syncImageList(dir, releases, { check: true })).toThrow('out of date');
      expect(readFileSync(path.join(dir, 'images.txt'), 'utf8')).toBe('stale\n');
      expect(syncImageList(dir, releases).state).toBe('updated');
      expect(syncImageList(dir, releases, { check: true }).state).toBe('checked');
      expect(syncImageList(root, releases, { check: true }).state).toBe('checked');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
