import { describe, expect, test } from 'bun:test';
import { parseFromImages, parseTargets, type ImageInfo } from './bake-scan.ts';
import { imageRepository, summarizeBase, summarizeVariants } from './readme.ts';

function image(bake: string, overrides: Partial<ImageInfo> = {}): ImageInfo {
  return {
    name: 'app', dir: 'app', bakePath: 'app/docker-bake.hcl', variables: {}, defaultTargets: [],
    targets: parseTargets(bake), dockerfiles: [], fromImages: [], registries: [], hasGhcr: false, ...overrides,
  };
}

describe('README variants', () => {
  test('default image, latest-tagged and abstract parent targets are not variants', () => {
    const bake = `
target "base" { platforms = ["linux/amd64"] }
target "app" { inherits = ["base"] tags = tags("latest") }
target "ssh" { inherits = ["base"]
  tags = tags("ssh") }
target "full" { inherits = ["base"]
  tags = tags("latest") }
`;
    expect(summarizeVariants(image(bake))).toBe('ssh');
    expect(summarizeVariants(image(bake, { defaultTargets: ['default', 'app', 'ssh'] }))).toBe('ssh');
    expect(summarizeVariants(image('target "app" { tags = tags("latest") }'))).toBe('-');
  });
});

describe('README base column', () => {
  test('repository part keeps registry ports and drops tags and digests', () => {
    expect(imageRepository('wener/app:3.24.1-ssh')).toBe('wener/app');
    expect(imageRepository('wener/app')).toBe('wener/app');
    expect(imageRepository('localhost:5000/team/app:1.0')).toBe('localhost:5000/team/app');
    expect(imageRepository(`quay.io/wener/base@sha256:${'a'.repeat(64)}`)).toBe('quay.io/wener/base');
  });

  test('bases are deduplicated, resolved, and exclude scratch and the image itself', () => {
    const fromImages = parseFromImages([
      'FROM wener/base:${ALPINE_RELEASE} AS build\nFROM build\nFROM scratch\n',
      'FROM --platform=$BUILDPLATFORM wener/app:${ALPINE_RELEASE}-ssh\nFROM wener/base:3.24\n',
    ]);
    const info = image('', { fromImages, variables: { ALPINE_RELEASE: '3.24.1' } });
    expect(summarizeBase(info)).toBe('`wener/app`<br>`wener/base`');
    expect(summarizeBase(info, 'wener/app')).toBe('`wener/base`');
    expect(summarizeBase(image(''))).toBe('-');
  });
});
