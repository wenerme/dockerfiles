import { describe, expect, test } from 'bun:test';
import {
  aliasRefs, executionBake, generatedBake, localRef, parseLocalRegistry, parseManifest, parseNamespace, parsePlatforms, planReleases, publishAction, regionEnd, regionStart,
  registryFailure, replaceReadmeRegion, resolveManifest, selectRelease, validateSelectors, versionVariables, type ImageManifest,
} from './manifest.ts';

function sample(): ImageManifest {
  return {
    schema: 1, registry: 'ghcr.io/wenerme/dockerfiles', source: 'https://github.com/wenerme/dockerfiles', images: [
      { name: 'base', variants: [{ name: 'default', build: { dir: 'base/base', target: 'base', variables: { alpine: 'ALPINE_RELEASE', revision: 'REV' } }, version: { scheme: 'alpine', alpine: '3.24.1', revision: 2 }, inputs: [] }] },
      { name: 'agent', variants: [{ name: 'default', build: { dir: 'agent', target: 'agent', variables: { alpine: 'ALPINE_RELEASE', revision: 'REV' } }, base: { image: 'base', variant: 'default', context: 'wener/base:${alpine}' }, version: { scheme: 'alpine', revision: 7 }, inputs: [] }] },
      { name: 'app', variants: [{ name: 'default', build: { dir: 'app', target: 'app', variables: { app: 'VERSION', alpine: 'ALPINE_RELEASE', revision: 'REV' } }, base: { image: 'base', variant: 'default', context: 'wener/base:${alpine}' }, version: { scheme: 'app', app: '5.0.0', revision: 3 }, inputs: [] }] },
      { name: 'builder', variants: [{ name: 'default', build: { dir: 'builder', target: 'builder', variables: { app: 'VERSION', alpine: 'ALPINE_RELEASE', revision: 'REV' } }, base: { image: 'base', variant: 'default', context: 'wener/base:${alpine}' }, version: { scheme: 'app-alpine', app: '5.0.0', revision: 4 }, inputs: [] }] },
    ],
  };
}

describe('version and dependency resolution', () => {
  test('three canonical schemes inherit Alpine while preserving independent revisions', () => {
    const releases = resolveManifest(sample());
    expect(releases.map((release) => release.tag)).toEqual(['3.24.1-r2', '3.24.1-r7', '5.0.0-r3', '5.0.0-alpine-3.24.1-r4']);
    expect(releases.every((release) => release.alpine === '3.24.1')).toBe(true);
  });

  test('upstream Alpine changes propagate to targets and variables, not the app identity', () => {
    const manifest = sample();
    manifest.images[0].variants[0].version.alpine = '3.24.2';
    const releases = resolveManifest(manifest);
    expect(selectRelease(releases, 'agent').tag).toBe('3.24.2-r7');
    expect(selectRelease(releases, 'app').tag).toBe('5.0.0-r3');
    expect(selectRelease(releases, 'builder').tag).toBe('5.0.0-alpine-3.24.2-r4');
    expect(versionVariables(selectRelease(releases, 'agent'))).toEqual({ ALPINE_RELEASE: '3.24.2', ALPINE_VERSION: '3.24', REV: '7' });
    // This read-only prototype resolves current desired values; it does not apply revision propagation.
    expect(manifest.images[1].variants[0].version.revision).toBe(7);
  });

  test('nondefault variants have prefixed tags and ambiguous image selectors fail', () => {
    const manifest = sample();
    manifest.images[1].variants.push({ ...manifest.images[1].variants[0], name: 'python' });
    const releases = resolveManifest(manifest);
    expect(selectRelease(releases, 'agent.python').tag).toBe('python-3.24.1-r7');
    expect(() => selectRelease(releases, 'agent')).toThrow('ambiguous');
  });

  test('unknown references, dependency cycles and conflicting inherited versions fail', () => {
    const missing = sample();
    missing.images[1].variants[0].base!.image = 'missing';
    expect(() => resolveManifest(missing)).toThrow('unknown dependency');
    const cyclic = sample();
    cyclic.images[0].variants[0].base = { image: 'agent', variant: 'default', context: 'wener/agent:${alpine}' };
    expect(() => resolveManifest(cyclic)).toThrow('dependency cycle');
    const conflict = sample();
    conflict.images[1].variants[0].version.alpine = '3.23.0';
    expect(() => resolveManifest(conflict)).toThrow('conflicts with base');
  });

  test('image-family plans include every variant while single-target commands stay unambiguous', () => {
    const manifest = sample();
    manifest.images[1].variants.push({ ...manifest.images[1].variants[0], name: 'python' });
    const releases = resolveManifest(manifest);
    expect(planReleases(releases, ['agent']).map((release) => release.id)).toEqual(['base.default', 'agent.default', 'agent.python']);
    expect(planReleases(releases, ['agent.python']).map((release) => release.id)).toEqual(['base.default', 'agent.python']);
    expect(() => selectRelease(releases, 'agent')).toThrow('ambiguous');
    expect(() => planReleases(releases, ['missing'])).toThrow('unknown image');
  });

  test('historical variants with an explicit external base retain their Alpine branch', () => {
    const manifest = sample();
    const legacy = manifest.images[1].variants[0];
    legacy.base = { ref: 'quay.io/wener/nginx:alpine-3.19.1', context: 'wener/nginx:alpine-${alpine}' };
    legacy.version.alpine = '3.19.1';
    manifest.images[0].variants[0].version.alpine = '3.24.2';
    const releases = resolveManifest(manifest);
    const release = selectRelease(releases, 'agent');
    expect(release.alpine).toBe('3.19.1');
    expect(release.dependencies).toEqual([]);
    expect(planReleases(releases, ['base']).map((release) => release.id)).not.toContain('agent.default');
    const bake = generatedBake({ target: { agent: {} } }, release, releases);
    expect(bake.target!.agent.contexts!['wener/nginx:alpine-3.19.1']).toBe('docker-image://quay.io/wener/nginx:alpine-3.19.1');
  });

  test('diamond graph produces ordered, deduplicated affected nodes and prerequisites', () => {
    const manifest = sample();
    manifest.images[3].variants[0].base = { image: 'agent', variant: 'default', context: 'wener/agent:${alpine}' };
    manifest.images[3].variants[0].inputs = [{ image: 'app', variant: 'default', context: 'build-tools' }];
    manifest.images.reverse();
    const releases = resolveManifest(manifest);
    expect(planReleases(releases, ['base']).map((release) => release.id)).toEqual(['base.default', 'agent.default', 'app.default', 'builder.default']);
    expect(planReleases(releases, ['agent', 'agent']).map((release) => release.id)).toEqual(['base.default', 'agent.default', 'app.default', 'builder.default']);
  });
});

describe('manifest validation', () => {
  const yaml = `schema: 1
registry: ghcr.io/wenerme/dockerfiles
source: https://github.com/wenerme/dockerfiles
images:
  - name: base
    variants:
      - name: default
        build:
          dir: base/base
          target: base
          variables: {alpine: ALPINE_RELEASE, revision: REV}
        version: {scheme: alpine, alpine: "3.24.1", revision: 0}
`;
  test('YAML is validated without requiring a Docker daemon', () => {
    expect(resolveManifest(parseManifest(yaml))[0].ref).toBe('ghcr.io/wenerme/dockerfiles/base:3.24.1-r0');
  });
  test('schema typos, unsafe directories, missing versions and fractional revisions fail', () => {
    expect(() => parseManifest(yaml.replace('variants:', 'variaents:'))).toThrow('unknown field');
    expect(() => parseManifest(yaml.replace('dir: base/base', 'dir: ../../private'))).toThrow('repository-relative');
    expect(() => parseManifest(yaml.replace('scheme: alpine', 'scheme: app'))).toThrow('app version is required');
    expect(() => parseManifest(yaml.replace('revision: 0}', 'revision: 0.5}'))).toThrow('nonnegative integer');
    expect(() => parseManifest(yaml.replace('source: https://github.com/wenerme/dockerfiles\n', ''))).toThrow('manifest.source');
    expect(() => parseManifest(yaml.replace('target: base', 'target: base\n          prepare: push'))).toThrow('Bake action');
    expect(parseManifest(yaml.replace('target: base', 'target: base\n          prepare: dl')).images[0].variants[0].build.prepare).toBe('dl');
  });
  test('duplicate IDs fail instead of hiding one variant', () => {
    const manifest = sample();
    manifest.images[0].variants.push(manifest.images[0].variants[0]);
    expect(() => resolveManifest(manifest)).toThrow('duplicate variant');
  });
});

describe('generated artifacts and publication states', () => {
  test('Bake preview replaces tags with GHCR canonical and uses the parent revision', () => {
    const releases = resolveManifest(sample());
    const agent = selectRelease(releases, 'agent');
    const source = { target: { agent: { context: 'agent', platforms: ['linux/arm64'], args: { ALPINE_MIRROR: 'mirror' }, tags: ['docker.io/wener/agent:latest'], contexts: { 'wener/base:3.24.1': 'docker-image://quay.io/wener/base:3.24.1' } } } };
    const bake = generatedBake(source, agent, releases);
    expect(bake.target!.agent.tags).toEqual(['ghcr.io/wenerme/dockerfiles/agent:3.24.1-r7']);
    expect(bake.target!.agent.contexts!['wener/base:3.24.1']).toBe('docker-image://ghcr.io/wenerme/dockerfiles/base:3.24.1-r2');
    expect(bake.target!.agent.args!.REV).toBe('7');
    expect(bake.target!.agent.args!.ALPINE_MIRROR).toBe('mirror');
    expect(source.target.agent.tags).toEqual(['docker.io/wener/agent:latest']);
  });

  test('dependency ARG bindings override ambient parent image args and keep the pinned context', () => {
    const manifest = sample();
    const variant = manifest.images[1].variants[0];
    variant.base!.arg = 'GO_BASE_IMAGE';
    const releases = resolveManifest(manifest);
    const release = selectRelease(releases, 'agent');
    const bake = generatedBake({ target: { agent: { args: { GO_BASE_IMAGE: 'unexpected/parent:latest' } } } }, release, releases);
    expect(bake.target!.agent.args!.GO_BASE_IMAGE).toBe('wener/base:3.24.1');
    expect(bake.target!.agent.contexts!['wener/base:3.24.1']).toBe('docker-image://ghcr.io/wenerme/dockerfiles/base:3.24.1-r2');
  });

  test('Bake preview adds OCI labels, platform override and only the selected target', () => {
    const releases = resolveManifest(sample());
    const agent = selectRelease(releases, 'agent');
    const source = { target: { agent: { context: 'agent', platforms: ['linux/amd64', 'linux/arm64'] }, other: { context: 'x' } } };
    const bake = generatedBake(source, agent, releases, { platforms: ['linux/amd64'], revision: 'a'.repeat(40) });
    expect(Object.keys(bake.target!)).toEqual(['agent']);
    expect(bake.target!.agent.platforms).toEqual(['linux/amd64']);
    expect(bake.target!.agent.labels).toEqual({
      'org.opencontainers.image.source': 'https://github.com/wenerme/dockerfiles',
      'org.opencontainers.image.version': '3.24.1-r7',
      'org.opencontainers.image.revision': 'a'.repeat(40),
    });
    expect(generatedBake(source, agent, releases).target!.agent.platforms).toEqual(['linux/amd64', 'linux/arm64']);
    expect(() => generatedBake(source, agent, releases, { revision: 'not-a-sha' })).toThrow('invalid source revision');
  });

  test('execution Bake pins local contexts to the build directory and keeps image/target contexts', () => {
    const bake = { target: { agent: { context: 'agent', contexts: {
      base: 'docker-image://ghcr.io/wenerme/dockerfiles/base:3.24.1-r2', stage: 'target:other', files: 'rootfs',
    } } } };
    const pinned = executionBake(bake, '/repo/agent');
    expect(pinned.target!.agent.context).toBe('/repo/agent/agent');
    expect(pinned.target!.agent.contexts).toEqual({
      base: 'docker-image://ghcr.io/wenerme/dockerfiles/base:3.24.1-r2', stage: 'target:other', files: '/repo/agent/rootfs',
    });
    expect(bake.target.agent.context).toBe('agent');
  });

  test('verification builds push to the local registry and consume parents built earlier in the run', () => {
    const releases = resolveManifest(sample());
    const agent = selectRelease(releases, 'agent');
    const registry = parseLocalRegistry('localhost:5000');
    const parent = localRef(selectRelease(releases, 'base').ref, registry);
    expect(parent).toBe('localhost:5000/wenerme/dockerfiles/base:3.24.1-r2');
    const bake = generatedBake({ target: { agent: {} } }, agent, releases, {
      ref: localRef(agent.ref, registry), dependencyRefs: new Map([['base.default', parent]]),
    });
    expect(bake.target!.agent.tags).toEqual(['localhost:5000/wenerme/dockerfiles/agent:3.24.1-r7']);
    expect(bake.target!.agent.contexts!['wener/base:3.24.1']).toBe(`docker-image://${parent}`);
    // The published label still names the canonical version.
    expect((bake.target!.agent.labels as Record<string, string>)['org.opencontainers.image.version']).toBe('3.24.1-r7');
    // Without a locally built parent, the published GHCR parent is used.
    expect(generatedBake({ target: { agent: {} } }, agent, releases, { dependencyRefs: new Map() }).target!.agent.contexts!['wener/base:3.24.1'])
      .toBe('docker-image://ghcr.io/wenerme/dockerfiles/base:3.24.1-r2');
    for (const value of ['ghcr.io', 'registry.example.com:5000', 'localhost', '0.0.0.0:5000', 'localhost:5000/x']) {
      expect(() => parseLocalRegistry(value)).toThrow('localhost:<port>');
    }
  });

  test('aliases resolve version templates, stay unique per repository and never look canonical', () => {
    const manifest = sample();
    manifest.images[3].variants[0].aliases = ['5', '5-alpine-${alpine}', '${app}'];
    const releases = resolveManifest(manifest);
    const builder = selectRelease(releases, 'builder');
    expect(builder.aliasTags).toEqual(['5', '5-alpine-3.24.1', '5.0.0']);
    expect(aliasRefs(builder)).toEqual([
      'ghcr.io/wenerme/dockerfiles/builder:5', 'ghcr.io/wenerme/dockerfiles/builder:5-alpine-3.24.1', 'ghcr.io/wenerme/dockerfiles/builder:5.0.0',
    ]);
    expect(aliasRefs(builder, 'localhost:5000')[0]).toBe('localhost:5000/wenerme/dockerfiles/builder:5');
    expect(selectRelease(releases, 'agent').aliasTags).toEqual([]);

    const canonicalLike = sample();
    canonicalLike.images[3].variants[0].aliases = ['5-r1'];
    expect(() => resolveManifest(canonicalLike)).toThrow('reserved for canonical');
    const collision = sample();
    collision.images[1].variants.push({ ...collision.images[1].variants[0], name: 'python', aliases: ['3.24.1-r7'.replace('-r7', '')] });
    collision.images[1].variants[0].aliases = ['3.24.1'];
    expect(() => resolveManifest(collision)).toThrow('alias tag collision');
    const yaml = `schema: 1\nregistry: ghcr.io/x/y\nsource: https://github.com/x/y\nimages:\n  - name: a\n    variants:\n      - name: default\n        build: { dir: a, target: a, variables: { alpine: A, revision: R } }\n        version: { scheme: alpine, alpine: "3.24.1", revision: 0 }\n        aliases: ["\${revision}"]\n`;
    expect(() => parseManifest(yaml)).toThrow('substitutions');
  });

  test('external parent refs follow the variant version and docker tracks validate their options', () => {
    const yaml = (base: string, track = '{ docker: debian, prefix: "13." }') => `schema: 1
registry: ghcr.io/wenerme/dockerfiles
source: https://github.com/wenerme/dockerfiles
images:
  - name: debian
    variants:
      - name: default
        build: { dir: debian, target: debian, variables: { app: VERSION, revision: REV } }
        base: ${base}
        version: { scheme: app, app: "13.7", revision: 0 }
        track: ${track}
`;
    const releases = resolveManifest(parseManifest(yaml('{ ref: "docker.io/library/debian:${app}", context: "debian:${app}" }')));
    const debian = selectRelease(releases, 'debian');
    expect(debian.base?.ref).toBe('docker.io/library/debian:13.7');
    expect(debian.track).toEqual({ docker: 'debian', prefix: '13.' });
    expect(generatedBake({ target: { debian: {} } }, debian, releases).target!.debian.contexts)
      .toEqual({ 'debian:13.7': 'docker-image://docker.io/library/debian:13.7' });
    expect(() => parseManifest(yaml('{ ref: "debian:${revision}", context: "debian" }'))).toThrow('substitutions');
    expect(() => parseManifest(yaml('{ ref: "debian:{app}", context: "debian" }'))).toThrow('substitutions');
    expect(() => parseManifest(yaml('{ ref: "debian:13", context: "debian" }', '{ apk: nginx, prefix: "1." }'))).toThrow('docker only');
    expect(() => parseManifest(yaml('{ ref: "debian:13", context: "debian" }', '{ docker: debian, github: a/b }'))).toThrow('exactly one');
  });

  test('sync target namespaces are registry/namespace pairs only', () => {
    expect(parseNamespace('docker.io/wener')).toBe('docker.io/wener');
    for (const value of ['wener', 'docker.io', 'docker.io/wener/php', 'docker.io/Wener', 'docker.io/wener;rm']) {
      expect(() => parseNamespace(value)).toThrow('<registry>/<namespace>');
    }
  });

  test('publish builds only missing tags and stops on unknown registry state', () => {
    expect(publishAction({ state: 'missing' })).toBe('build');
    expect(publishAction({ state: 'published', digest: `sha256:${'0'.repeat(64)}` })).toBe('skip');
    expect(() => publishAction({ state: 'inaccessible', detail: 'registry authentication or permission required' })).toThrow('authentication');
    expect(() => publishAction({ state: 'error' })).toThrow('refusing to publish');
    expect(() => publishAction({ state: 'unchecked' })).toThrow('refusing to publish');
  });

  test('platform overrides are validated and deduplicated', () => {
    expect(parsePlatforms(undefined)).toBeUndefined();
    expect(parsePlatforms(' ')).toBeUndefined();
    expect(parsePlatforms('linux/amd64, linux/arm64,linux/amd64')).toEqual(['linux/amd64', 'linux/arm64']);
    expect(() => parsePlatforms('linux/amd64;rm')).toThrow('unsupported platform');
    expect(() => parsePlatforms('windows/amd64')).toThrow('unsupported platform');
  });

  test('publish selectors must be image IDs, not options', () => {
    expect(() => validateSelectors(['base', 'agent.default', 'node-builder'])).not.toThrow();
    expect(() => validateSelectors(['--push'])).toThrow('invalid image selector');
    expect(() => validateSelectors(['base;rm'])).toThrow('invalid image selector');
    expect(() => validateSelectors([])).not.toThrow();
  });

  test('authentication and network failures cannot be presented as missing images', () => {
    expect(registryFailure('MANIFEST_UNKNOWN: manifest unknown').state).toBe('missing');
    expect(registryFailure('ERROR: ghcr.io/wenerme/dockerfiles/base:3.24.1-r0: not found').state).toBe('missing');
    expect(registryFailure('manifest unknown: manifest unknown').state).toBe('missing');
    expect(registryFailure('no such manifest: ghcr.io/x/y:1').state).toBe('missing');
    expect(registryFailure('NAME_UNKNOWN: repository name not known to registry').state).toBe('missing');
    expect(registryFailure('404 Not Found').state).toBe('missing');
    expect(registryFailure('unknown: authentication required').state).toBe('inaccessible');
    expect(registryFailure('UNAUTHORIZED: authentication required; tag not found').state).toBe('inaccessible');
    expect(registryFailure('403 Forbidden').state).toBe('inaccessible');
    expect(registryFailure('dial tcp: i/o timeout').state).toBe('error');
    expect(registryFailure('unexpected EOF').state).toBe('error');
  });

  test('README replacement preserves handwritten content exactly and is idempotent', () => {
    const prefix = '# Human text\n\n';
    const suffix = '\n\nCustom instructions\n';
    const source = `${prefix}${regionStart}\nold\n${regionEnd}${suffix}`;
    const updated = replaceReadmeRegion(source, 'new table');
    expect(updated).toBe(`${prefix}${regionStart}\n\nnew table\n\n${regionEnd}${suffix}`);
    expect(replaceReadmeRegion(updated, 'new table')).toBe(updated);
  });

  test('malformed or duplicate README markers fail before overwriting text', () => {
    expect(() => replaceReadmeRegion('handwritten README', 'body')).toThrow('exactly one');
    expect(() => replaceReadmeRegion(`${regionEnd}${regionStart}`, 'body')).toThrow('ordered');
    expect(() => replaceReadmeRegion(`${regionStart}${regionStart}${regionEnd}`, 'body')).toThrow('exactly one');
  });
});
