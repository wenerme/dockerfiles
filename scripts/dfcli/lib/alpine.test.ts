import { describe, expect, test } from 'bun:test';
import { parseAlpineReleases, planAlpineUpdate, planRevisionBump, planUpdate, renderManifestUpdate, type AlpineBranches } from './alpine.ts';
import { parseManifest, resolveManifest } from './manifest.ts';

const fixture = `schema: 1
registry: ghcr.io/wenerme/dockerfiles
source: https://github.com/wenerme/dockerfiles

images:
  - name: base
    variants:
      - name: default
        build:
          dir: base/base
          target: base
          variables:
            alpine: ALPINE_RELEASE
            revision: REV
        version:
          scheme: alpine
          alpine: "3.24.1" # keep this comment
          revision: 0

  # tagged by app version only
  - name: pdns
    variants:
      - name: default
        build:
          dir: pdns
          target: pdns
          variables:
            app: VERSION
            alpine: ALPINE_RELEASE
            revision: REV
        base:
          image: base
          variant: default
          context: "wener/base:\${alpine}"
        version:
          scheme: app
          app: "5.0.7"
          revision: 2

  - name: nginx
    variants:
      - name: default
        build:
          dir: nginx
          target: nginx
          variables:
            app: VERSION
            alpine: ALPINE_RELEASE
            revision: REV
        base:
          image: base
          variant: default
          context: "wener/base:\${alpine}"
        version:
          scheme: app-alpine
          app: "1.30.4-r1"
          revision: 3

  - name: php
    variants:
      - name: "8.2"
        build:
          dir: php
          target: "82"
          variables:
            app: PHP82_VERSION
            alpine: PHP82_ALPINE_RELEASE
            revision: PHP82_REV
        base:
          ref: "quay.io/wener/nginx:alpine-3.19.1@sha256:${'a'.repeat(64)}"
          context: "wener/nginx:alpine-\${alpine}"
        version:
          scheme: app-alpine
          app: "8.2.26-r0"
          alpine: "3.19.1"
          revision: 0
      - name: "8.4"
        build:
          dir: php
          target: "84"
          variables:
            app: PHP84_VERSION
            alpine: PHP84_ALPINE_RELEASE
            revision: PHP84_REV
        base:
          image: nginx
          variant: default
          context: "wener/nginx:alpine-\${alpine}"
        version:
          scheme: app-alpine
          app: "8.4.26-r0"
          revision: 1
        aliases: ["8.4", "8.4-alpine-\${alpine}"]

  - name: go-builder
    variants:
      - name: default
        build:
          dir: go-builder
          target: go-builder
          variables:
            app: GO_PACKAGE_VERSION
            alpine: ALPINE_RELEASE
            revision: REV
        base:
          ref: "quay.io/wener/go:1.26.3-r0-alpine-3.24.1-r0@sha256:${'b'.repeat(64)}"
          context: "wener/go:\${app}-alpine-\${alpine}-r0"
          arg: GO_BASE_IMAGE
        version:
          scheme: app-alpine
          app: "1.26.3-r0"
          alpine: "3.24.1"
          revision: 0
`;

const upstream: AlpineBranches = new Map([['3.24', '3.24.2'], ['3.23', '3.23.6'], ['3.19', '3.19.9']]);

describe('Alpine releases', () => {
  test('picks the highest patch per stable branch regardless of order and ignores edge', () => {
    const branches = parseAlpineReleases({ release_branches: [
      { rel_branch: 'edge', releases: [] },
      { rel_branch: 'v3.24', releases: [{ version: '3.24.1' }, { version: '3.24.10' }, { version: '3.24.2' }] },
      { rel_branch: 'v3.23', releases: [{ version: '3.23.6' }, { version: 'bogus' }, { version: '3.22.9' }] },
    ] });
    expect([...branches]).toEqual([['3.24', '3.24.10'], ['3.23', '3.23.6']]);
    expect(() => parseAlpineReleases({})).toThrow('release_branches');
    expect(() => parseAlpineReleases({ release_branches: [{ rel_branch: 'edge' }] })).toThrow('no stable branch');
  });
});

describe('Alpine update plan', () => {
  test('updates the internal chain, bumps app-tagged images, and leaves pinned parents alone', () => {
    const plan = planAlpineUpdate(parseManifest(fixture), upstream);
    expect(plan.changes.map((change) => [change.id, change.from.tag, change.to.tag])).toEqual([
      ['base.default', '3.24.1-r0', '3.24.2-r0'],
      ['pdns.default', '5.0.7-r2', '5.0.7-r3'],
      ['nginx.default', '1.30.4-r1-alpine-3.24.1-r3', '1.30.4-r1-alpine-3.24.2-r0'],
      ['php.8.4', '8.4-8.4.26-r0-alpine-3.24.1-r1', '8.4-8.4.26-r0-alpine-3.24.2-r0'],
    ]);
    expect(plan.changes.find((change) => change.id === 'pdns.default')!.reason).toBe('parent changed: base.default');
    // php 8.2 stays on its historical branch silently; go-builder needs a new parent first.
    expect(plan.notes).toEqual([expect.stringContaining('go-builder.default: Alpine 3.24.2 is available; publish a new pinned parent first')]);
    const releases = resolveManifest(plan.manifest);
    expect(releases.find((release) => release.id === 'php.8.2')!.tag).toBe('8.2-8.2.26-r0-alpine-3.19.1-r0');
    expect(releases.find((release) => release.id === 'go-builder.default')!.tag).toBe('1.26.3-r0-alpine-3.24.1-r0');
  });

  test('is idempotent once the manifest is current', () => {
    const first = planAlpineUpdate(parseManifest(fixture), upstream);
    const second = planAlpineUpdate(first.manifest, upstream);
    expect(second.changes).toEqual([]);
    expect(second.manifest).toEqual(first.manifest);
  });

  test('a newer branch is a note, never an automatic upgrade', () => {
    const plan = planAlpineUpdate(parseManifest(fixture), new Map([...upstream, ['3.25', '3.25.0']]));
    expect(plan.changes[0].to.tag).toBe('3.24.2-r0');
    expect(plan.notes).toContain('base.default: Alpine 3.25 is available; branch upgrades are manual');
  });

  test('a branch missing upstream is reported and kept', () => {
    const plan = planAlpineUpdate(parseManifest(fixture), new Map([['3.19', '3.19.9']]));
    expect(plan.changes).toEqual([]);
    expect(plan.notes).toContain('base.default: Alpine 3.24 is no longer listed upstream; staying on 3.24.1');
  });
});

describe('tracked version update', () => {
  test('a newer app version starts again at r0 and dependents are rebuilt once', () => {
    const plan = planUpdate(parseManifest(fixture), new Map([['3.24', '3.24.1'], ['3.19', '3.19.1']]), new Map([
      ['nginx.default', { version: '1.30.4-r3' }],
      ['pdns.default', { version: '5.0.7' }],
      ['php.8.4', { version: '8.4.26-r0' }],
    ]));
    expect(plan.changes.map((change) => [change.id, change.to.tag, change.reason])).toEqual([
      ['nginx.default', '1.30.4-r3-alpine-3.24.1-r0', 'app 1.30.4-r1 -> 1.30.4-r3'],
      ['php.8.4', '8.4-8.4.26-r0-alpine-3.24.1-r2', 'parent changed: nginx.default'],
    ]);
    expect(plan.notes).toEqual([]);
  });

  test('lagging or failing upstreams never downgrade and are reported', () => {
    const plan = planUpdate(parseManifest(fixture), new Map([['3.24', '3.24.1'], ['3.19', '3.19.1']]), new Map([
      ['nginx.default', { version: '1.30.3-r0' }],
      ['pdns.default', { error: 'HTTP 503' }],
    ]));
    expect(plan.changes).toEqual([]);
    expect(plan.notes).toEqual([
      'nginx.default: upstream 1.30.3-r0 is older than 1.30.4-r1; keeping 1.30.4-r1',
      'pdns.default: upstream lookup failed: HTTP 503',
    ]);
  });

  test('without the Alpine release list, tracked app versions still update', () => {
    const plan = planUpdate(parseManifest(fixture), new Map(), new Map([['nginx.default', { version: '1.30.4-r3' }]]));
    expect(plan.changes.map((change) => change.id)).toEqual(['nginx.default', 'php.8.4']);
    expect(plan.changes[0].to.tag).toBe('1.30.4-r3-alpine-3.24.1-r0');
  });

  test('Alpine patches and app versions combine into one plan', () => {
    const plan = planUpdate(parseManifest(fixture), upstream, new Map([['php.8.4', { version: '8.4.27-r0' }]]));
    expect(plan.changes.find((change) => change.id === 'php.8.4')).toMatchObject({
      to: { tag: '8.4-8.4.27-r0-alpine-3.24.2-r0' }, reason: 'app 8.4.26-r0 -> 8.4.27-r0',
    });
  });
});

describe('revision bump', () => {
  test('a base content change bumps it and every internal dependent once, not pinned or unrelated variants', () => {
    const plan = planRevisionBump(parseManifest(fixture), ['base']);
    expect(plan.changes.map((change) => [change.id, change.from.tag, change.to.tag, change.reason])).toEqual([
      ['base.default', '3.24.1-r0', '3.24.1-r1', 'revision bump'],
      ['pdns.default', '5.0.7-r2', '5.0.7-r3', 'parent changed: base.default'],
      ['nginx.default', '1.30.4-r1-alpine-3.24.1-r3', '1.30.4-r1-alpine-3.24.1-r4', 'parent changed: base.default'],
      ['php.8.4', '8.4-8.4.26-r0-alpine-3.24.1-r1', '8.4-8.4.26-r0-alpine-3.24.1-r2', 'parent changed: nginx.default'],
    ]);
    // aliases follow the canonical tag; they are not versioned themselves
    expect(resolveManifest(plan.manifest).find((release) => release.id === 'php.8.4')!.aliasTags).toEqual(['8.4', '8.4-alpine-3.24.1']);
    expect(() => planRevisionBump(parseManifest(fixture), ['missing'])).toThrow('unknown image');
    expect(() => planRevisionBump(parseManifest(fixture), [])).toThrow('select at least one');
  });

  test('the renderer writes app versions and refuses adding or removing version fields', () => {
    const plan = planRevisionBump(parseManifest(fixture), ['base']);
    plan.manifest.images[3].variants[1].version.app = '8.4.27-r0';
    const output = renderManifestUpdate(fixture, plan.manifest);
    expect(output).toContain('app: "8.4.27-r0"');
    expect(parseManifest(output)).toEqual(plan.manifest);
    delete plan.manifest.images[3].variants[1].version.app;
    expect(() => renderManifestUpdate(fixture, plan.manifest)).toThrow();
  });
});

describe('manifest rewrite', () => {
  test('changes only the planned fields and keeps comments and layout', () => {
    const plan = planAlpineUpdate(parseManifest(fixture), upstream);
    const output = renderManifestUpdate(fixture, plan.manifest);
    const changed = fixture.split('\n').flatMap((line, index) => line === output.split('\n')[index] ? [] : [[line.trim(), output.split('\n')[index].trim()]]);
    expect(changed).toEqual([
      ['alpine: "3.24.1" # keep this comment', 'alpine: "3.24.2" # keep this comment'],
      ['revision: 2', 'revision: 3'],
      ['revision: 3', 'revision: 0'],
      ['revision: 1', 'revision: 0'],
    ]);
    expect(parseManifest(output)).toEqual(plan.manifest);
    expect(renderManifestUpdate(fixture, parseManifest(fixture))).toBe(fixture);
  });

  test('adding a version field is refused instead of guessed', () => {
    const next = parseManifest(fixture);
    next.images[1].variants[0].version.alpine = '3.24.2';
    expect(() => renderManifestUpdate(fixture, next)).toThrow('manual edit');
  });
});
