import { describe, expect, test } from 'bun:test';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { parseFromImages, parseTargets, type ImageInfo } from './bake-scan.ts';
import { loadReleases, regionEnd, regionStart } from './manifest.ts';
import { generateReadme, imageRepository, summarizeBase, summarizeVariants, syncReadmes } from './readme.ts';
import { root } from './repo.ts';

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

describe('bilingual README generation', () => {
  const releases = loadReleases(root);
  const images = [image('', { name: 'extra', dir: 'extra' })];

  test('both languages show the same image data without a dependency diagram', () => {
    const english = generateReadme(images, releases);
    const chinese = generateReadme(images, releases, 'zh-CN');
    expect(english).not.toMatch(/\p{Script=Han}/u);
    expect(chinese).toContain('其他镜像');
    expect(english).toContain('Other Images');
    // Internal tooling stays out of the public README.
    for (const output of [english, chinese]) expect(output).not.toMatch(/just |dfcli|manifest\.yaml|\bCI\b|Bake/);
    for (const output of [english, chinese]) {
      expect(output).not.toContain('mermaid');
      expect(output).not.toContain('flowchart');
      for (const release of releases) expect(output).toContain(release.ref);
    }
    const rows = (output: string) => output.split('\n').filter((line) => /^\| (?!-|Image|镜像)/.test(line));
    expect(rows(english)).toEqual(rows(chinese));
  });

  test('updates both documents, preserves handwritten text and checks either language without writing', () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'dfcli-readme-'));
    const files = ['README.md', 'README.zh-CN.md'];
    const original = `# Handwritten introduction\n\n${regionStart}\n\n\`\`\`mermaid\nold graph\n\`\`\`\n\n${regionEnd}\n\nHandwritten footer\n`;
    try {
      for (const file of files) writeFileSync(path.join(dir, file), original);
      expect(() => syncReadmes(dir, images, releases, { check: true })).toThrow('README.md, README.zh-CN.md');
      for (const file of files) expect(readFileSync(path.join(dir, file), 'utf8')).toBe(original);
      expect(syncReadmes(dir, images, releases)).toEqual(files.map((file) => ({ file, state: 'updated' })));
      for (const file of files) {
        const content = readFileSync(path.join(dir, file), 'utf8');
        expect(content).toStartWith('# Handwritten introduction\n\n');
        expect(content).toEndWith('\n\nHandwritten footer\n');
        expect(content).not.toContain('mermaid');
      }
      expect(syncReadmes(dir, images, releases, { check: true })).toEqual(files.map((file) => ({ file, state: 'checked' })));
      expect(syncReadmes(dir, images, releases)).toEqual(files.map((file) => ({ file, state: 'unchanged' })));
      const english = readFileSync(path.join(dir, files[0]), 'utf8');
      const staleChinese = readFileSync(path.join(dir, files[1]), 'utf8').replace('### 受管理镜像', '### Outdated heading');
      writeFileSync(path.join(dir, files[1]), staleChinese);
      expect(() => syncReadmes(dir, images, releases, { check: true })).toThrow('README.zh-CN.md generated region is out of date');
      expect(readFileSync(path.join(dir, files[0]), 'utf8')).toBe(english);
      expect(readFileSync(path.join(dir, files[1]), 'utf8')).toBe(staleChinese);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test('invalid markers in the second document fail before the first is changed', () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'dfcli-readme-'));
    const english = `${regionStart}\nold\n${regionEnd}`;
    try {
      writeFileSync(path.join(dir, 'README.md'), english);
      writeFileSync(path.join(dir, 'README.zh-CN.md'), '# Missing markers');
      expect(() => syncReadmes(dir, images, releases)).toThrow('exactly one');
      expect(readFileSync(path.join(dir, 'README.md'), 'utf8')).toBe(english);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
