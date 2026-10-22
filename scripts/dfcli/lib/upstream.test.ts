import { describe, expect, test } from 'bun:test';
import type { Release } from './manifest.ts';
import { repositoryState } from './regctl.ts';
import { compareLoose, nodejsMuslVersion, parseApkIndex, releaseVersion, UpstreamResolver } from './upstream.ts';

describe('upstream versions', () => {
  test('loose order handles apk package releases and multi-digit segments', () => {
    expect(compareLoose('1.30.4-r1', '1.30.4-r3')).toBeLessThan(0);
    expect(compareLoose('1.30.4-r3', '1.31.0-r0')).toBeLessThan(0);
    expect(compareLoose('24.9.0', '24.22.1')).toBeLessThan(0);
    expect(compareLoose('5.0.7', '5.0.7')).toBe(0);
    expect(compareLoose('5.0.7-r1', '5.0.7')).toBeGreaterThan(0);
  });

  test('APKINDEX records and release tags parse into versions', () => {
    const index = 'C:Q1abc\nP:nginx\nV:1.30.4-r1\nA:x86_64\n\nP:nginx-mod-stream\nV:1.30.4-r1\n\n';
    expect([...parseApkIndex(index)]).toEqual([['nginx', '1.30.4-r1'], ['nginx-mod-stream', '1.30.4-r1']]);
    expect(releaseVersion('v0.71.1')).toBe('0.71.1');
    expect(releaseVersion('bun-v1.4.3')).toBe('1.4.3');
    expect(releaseVersion('v2.0.0-rc.1')).toBeUndefined();
  });

  test('Node.js lines require musl builds for both architectures', () => {
    const index = [
      { version: 'v24.23.0', files: ['linux-x64-musl'] },
      { version: 'v24.22.1', files: ['linux-arm64-musl', 'linux-x64-musl'] },
      { version: 'v26.1.0', files: ['linux-arm64-musl', 'linux-x64-musl'] },
      { version: 'v24.9.0', files: ['linux-arm64-musl', 'linux-x64-musl'] },
    ];
    expect(nodejsMuslVersion(index, '24')).toBe('24.22.1');
    expect(nodejsMuslVersion(index, '22')).toBeUndefined();
    expect(() => nodejsMuslVersion({}, '24')).toThrow('expected a list');
  });

  test('lookups are cached per run and failures are reported per variant', async () => {
    const calls: string[] = [];
    const fake = (async (url: string | URL | Request) => {
      calls.push(String(url));
      if (String(url).includes('/repos/fatedier/frp/')) return Response.json({ tag_name: 'v0.71.1' });
      if (String(url).includes('/repos/oven-sh/bun/')) return new Response('rate limited', { status: 403 });
      return Response.json([{ version: 'v24.22.1', files: ['linux-arm64-musl', 'linux-x64-musl'] }]);
    }) as typeof fetch;
    const resolver = new UpstreamResolver({ alpineMirror: 'https://mirror.invalid/alpine', fetch: fake });
    const release = { alpine: '3.24.2' } as Release;
    expect(await resolver.latest({ github: 'fatedier/frp' }, release)).toEqual({ version: '0.71.1' });
    expect(await resolver.latest({ github: 'fatedier/frp' }, release)).toEqual({ version: '0.71.1' });
    expect(await resolver.latest({ nodejs: '24' }, release)).toEqual({ version: '24.22.1' });
    expect((await resolver.latest({ github: 'oven-sh/bun' }, release)).error).toContain('HTTP 403');
    expect((await resolver.latest({ apk: 'nginx' }, {} as Release)).error).toContain('needs an Alpine version');
    expect(calls.filter((url) => url.includes('fatedier'))).toHaveLength(1);
  });

  test('only a known missing-repository answer skips a sync target; other failures are errors', () => {
    const result = (exitCode: number, stderr = '', timedOut = false) => repositoryState({ exitCode, stderr, timedOut });
    expect(result(0)).toEqual({ state: 'exists' });
    expect(result(1, 'request failed: not found [http 404]: {"errors":[{"code":"NAME_UNKNOWN"}]}')).toEqual({ state: 'missing' });
    expect(result(1, 'failed to list tags for quay.io/wener/agent:latest: unauthorized')).toEqual({ state: 'missing' });
    expect(result(1, 'dial tcp: i/o timeout')).toEqual({ state: 'error', detail: 'dial tcp: i/o timeout' });
    expect(result(127)).toMatchObject({ state: 'error' });
    expect(result(1, '', true)).toEqual({ state: 'error', detail: 'regctl timed out' });
  });
});
