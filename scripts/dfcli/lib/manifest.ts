import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { YAML } from 'bun';
import { capture, lastErrorLine, run } from './repo.ts';

export type VersionScheme = 'alpine' | 'app' | 'app-alpine';
type VersionField = 'app' | 'alpine' | 'revision';
export interface Dependency {
  image?: string;
  variant?: string;
  ref?: string;
  context: string;
  arg?: string;
}
/** Where newer application versions come from; exactly one source is set. */
export interface Track {
  /** Alpine package in the variant's Alpine branch (main or community); both architectures must agree. */
  apk?: string;
  /** GitHub repository whose latest release tag is the version, e.g. fatedier/frp. */
  github?: string;
  /** Node.js major line, resolved from the unofficial musl builds that node-builder downloads. */
  nodejs?: string;
  /** apk only: keep the -rN package release in the version (default true). */
  pkgrel?: boolean;
}

export interface ManifestVariant {
  name: string;
  build: { dir: string; target: string; variables: Partial<Record<VersionField, string>>; prepare?: string };
  version: { scheme: VersionScheme; app?: string; alpine?: string; revision: number };
  base?: Dependency;
  inputs: Dependency[];
  /** Moving tags such as "8.4" or "8.4-alpine-${alpine}", repointed to the canonical tag after each publish. */
  aliases?: string[];
  track?: Track;
}
export interface ImageManifest {
  schema: 1;
  registry: string;
  source: string;
  images: { name: string; variants: ManifestVariant[] }[];
}
export interface Release extends ManifestVariant {
  id: string;
  image: string;
  alpine?: string;
  tag: string;
  /** Registry repository without tag, e.g. ghcr.io/wenerme/dockerfiles/php. */
  repository: string;
  ref: string;
  /** Resolved alias tags; they never end in -rN, which is reserved for canonical tags. */
  aliasTags: string[];
  source: string;
  dependencies: string[];
}
export interface BakeTarget {
  context?: string;
  dockerfile?: string;
  platforms?: string[];
  args?: Record<string, string>;
  contexts?: Record<string, string>;
  tags?: string[];
  [key: string]: unknown;
}
export interface BakePrint {
  group?: Record<string, { targets: string[] }>;
  target?: Record<string, BakeTarget>;
}
export type Publication = {
  state: 'unchecked' | 'published' | 'missing' | 'inaccessible' | 'error';
  digest?: string;
  detail?: string;
};
export const regionStart = '<!-- BEGIN GENERATED IMAGES -->';
export const regionEnd = '<!-- END GENERATED IMAGES -->';

function object(value: unknown, label: string, keys: string[]): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${label}: expected mapping`);
  const result = value as Record<string, unknown>;
  for (const key of Object.keys(result)) {
    if (!keys.includes(key)) throw new Error(`${label}: unknown field ${key}`);
  }
  return result;
}

function list(value: unknown, label: string): unknown[] {
  if (!Array.isArray(value) || !value.length) throw new Error(`${label}: expected nonempty list`);
  return value;
}

function text(value: unknown, label: string, pattern?: RegExp): string {
  if (typeof value !== 'string' || !value || (pattern && !pattern.test(value))) {
    throw new Error(`${label}: invalid string ${JSON.stringify(value)}`);
  }
  return value;
}

const slug = /^[a-z0-9]+(?:[._-][a-z0-9]+)*$/;
const templateField = /\$\{(?!alpine\}|app\})/;
const tagPattern = /^[A-Za-z0-9_][A-Za-z0-9_.-]{0,127}$/;
const alpineVersion = /^\d+\.\d+\.\d+$/;
const appVersion = /^[0-9][a-zA-Z0-9_.-]*$/;

function dependency(value: unknown, label: string): Dependency {
  const item = object(value, label, ['image', 'variant', 'ref', 'context', 'arg']);
  const arg = item.arg === undefined ? undefined : text(item.arg, `${label}.arg`, /^[A-Z][A-Z0-9_]*$/);
  const context = text(item.context, `${label}.context`);
  if (templateField.test(context) || /[\s|`]/.test(context)) {
    throw new Error(`${label}.context: only \${alpine} and \${app} substitutions are supported`);
  }
  if (item.ref !== undefined) {
    if (item.image !== undefined || item.variant !== undefined) throw new Error(`${label}: use ref or image/variant`);
    return { ref: text(item.ref, `${label}.ref`, /^[a-zA-Z0-9_./:@-]+$/), context, arg };
  }
  return {
    image: text(item.image, `${label}.image`, slug),
    variant: text(item.variant ?? 'default', `${label}.variant`, slug),
    context,
    arg,
  };
}

function track(value: unknown, label: string, scheme: string): Track {
  const item = object(value, label, ['apk', 'github', 'nodejs', 'pkgrel']);
  const sources = (['apk', 'github', 'nodejs'] as const).filter((key) => item[key] !== undefined);
  if (sources.length !== 1) throw new Error(`${label}: set exactly one of apk, github, nodejs`);
  if (scheme === 'alpine') throw new Error(`${label}: alpine scheme has no app version to track`);
  const result: Track = {};
  if (item.apk !== undefined) result.apk = text(item.apk, `${label}.apk`, /^[a-z0-9][a-z0-9_.+-]*$/);
  if (item.github !== undefined) result.github = text(item.github, `${label}.github`, /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/);
  if (item.nodejs !== undefined) result.nodejs = text(String(item.nodejs), `${label}.nodejs`, /^\d+$/);
  if (item.pkgrel !== undefined) {
    if (typeof item.pkgrel !== 'boolean' || !result.apk) throw new Error(`${label}.pkgrel: boolean, apk only`);
    result.pkgrel = item.pkgrel;
  }
  return result;
}

export function parseManifest(source: string): ImageManifest {
  const config = object(YAML.parse(source), 'manifest', ['schema', 'registry', 'source', 'images']);
  if (config.schema !== 1) throw new Error('manifest.schema: expected 1');
  const registry = text(config.registry, 'manifest.registry', /^ghcr\.io\/[a-z0-9_.-]+(?:\/[a-z0-9_.-]+)*$/);
  const repository = text(config.source, 'manifest.source', /^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/);
  const images = list(config.images, 'manifest.images').map((rawImage) => {
    const image = object(rawImage, 'image', ['name', 'variants']);
    const name = text(image.name, 'image.name', slug);
    const variants = list(image.variants, `${name}.variants`).map((rawVariant): ManifestVariant => {
      const label = `${name}.variant`;
      const variant = object(rawVariant, label, ['name', 'build', 'version', 'base', 'inputs', 'aliases', 'track']);
      const build = object(variant.build, `${label}.build`, ['dir', 'target', 'variables', 'prepare']);
      const prepare = build.prepare === undefined ? undefined : text(build.prepare, `${label}.build.prepare`, /^[a-z][a-z0-9_-]*$/);
      if (prepare && ['push', 'build', 'load', 'print', 'info'].includes(prepare)) {
        throw new Error(`${label}.build.prepare: ${prepare} is a Bake action, not a preparation step`);
      }
      const dir = text(build.dir, `${label}.build.dir`);
      if (path.isAbsolute(dir) || dir.split(/[\\/]/).includes('..') || !/^[a-zA-Z0-9_./-]+$/.test(dir)) {
        throw new Error(`${label}.build.dir: expected repository-relative directory`);
      }
      const variables = object(build.variables, `${label}.build.variables`, ['app', 'alpine', 'revision']);
      const bindings: Partial<Record<VersionField, string>> = {};
      for (const [field, value] of Object.entries(variables)) {
        bindings[field as VersionField] = text(value, `${label}.build.variables.${field}`, /^[A-Z][A-Z0-9_]*$/);
      }
      if (new Set(Object.values(bindings)).size !== Object.keys(bindings).length) {
        throw new Error(`${label}.build.variables: duplicate variable binding`);
      }
      const version = object(variant.version, `${label}.version`, ['scheme', 'app', 'alpine', 'revision']);
      const scheme = text(version.scheme, `${label}.version.scheme`);
      if (!['alpine', 'app', 'app-alpine'].includes(scheme)) throw new Error(`${label}: invalid version scheme ${scheme}`);
      if (!Number.isSafeInteger(version.revision) || (version.revision as number) < 0) {
        throw new Error(`${label}.version.revision: expected nonnegative integer`);
      }
      const app = version.app === undefined ? undefined : text(version.app, `${label}.version.app`, appVersion);
      const alpine = version.alpine === undefined ? undefined : text(version.alpine, `${label}.version.alpine`, alpineVersion);
      if (scheme !== 'alpine' && !app) throw new Error(`${label}: app version is required`);
      if (scheme === 'alpine' && app) throw new Error(`${label}: alpine scheme does not use app version`);
      if (!bindings.revision || (scheme !== 'alpine' && !bindings.app)) throw new Error(`${label}: missing version variable binding`);
      if (variant.inputs !== undefined && !Array.isArray(variant.inputs)) throw new Error(`${label}.inputs: expected list`);
      const aliases = variant.aliases === undefined ? [] : list(variant.aliases, `${label}.aliases`).map((alias) => {
        const value = text(alias, `${label}.aliases`, /^[A-Za-z0-9_.${}-]+$/);
        if (templateField.test(value)) throw new Error(`${label}.aliases: only \${alpine} and \${app} substitutions are supported`);
        return value;
      });
      return {
        name: text(variant.name, `${label}.name`, slug),
        build: { dir, target: text(build.target, `${label}.build.target`, /^[a-zA-Z0-9_.-]+$/), variables: bindings, prepare },
        version: { scheme: scheme as VersionScheme, app, alpine, revision: version.revision as number },
        base: variant.base === undefined ? undefined : dependency(variant.base, `${label}.base`),
        inputs: (variant.inputs as unknown[] | undefined ?? []).map((item) => dependency(item, `${label}.inputs`)),
        aliases,
        ...(variant.track === undefined ? {} : { track: track(variant.track, `${label}.track`, scheme) }),
      };
    });
    return { name, variants };
  });
  if (new Set(images.map((image) => image.name)).size !== images.length) throw new Error('duplicate image name');
  return { schema: 1, registry, source: repository, images };
}

function internalId(dep: Dependency): string | undefined {
  return dep.image ? `${dep.image}.${dep.variant}` : undefined;
}

export function resolveManifest(manifest: ImageManifest): Release[] {
  const variants = new Map<string, ManifestVariant & { image: string }>();
  for (const image of manifest.images) {
    for (const variant of image.variants) {
      const id = `${image.name}.${variant.name}`;
      if (variants.has(id)) throw new Error(`duplicate variant ${id}`);
      variants.set(id, { ...variant, image: image.name });
    }
  }
  const resolved = new Map<string, Release>();
  const visiting: string[] = [];
  const visit = (id: string): Release => {
    const existing = resolved.get(id);
    if (existing) return existing;
    if (visiting.includes(id)) throw new Error(`dependency cycle: ${[...visiting, id].join(' -> ')}`);
    const variant = variants.get(id);
    if (!variant) throw new Error(`unknown dependency ${id}`);
    visiting.push(id);
    const dependencies = [...new Set([variant.base, ...variant.inputs].filter((dep): dep is Dependency => Boolean(dep)).map(internalId).filter((dep): dep is string => Boolean(dep)))];
    for (const dep of dependencies) visit(dep);
    const baseId = variant.base && internalId(variant.base);
    const inheritedAlpine = baseId ? resolved.get(baseId)?.alpine : undefined;
    const alpine = variant.version.alpine ?? inheritedAlpine;
    if (variant.version.alpine && inheritedAlpine && variant.version.alpine !== inheritedAlpine) {
      throw new Error(`${id}: Alpine version conflicts with base ${baseId}`);
    }
    if (variant.version.scheme !== 'app' && !alpine) throw new Error(`${id}: missing Alpine version or inheritable base`);
    if (alpine && !variant.build.variables.alpine) throw new Error(`${id}: missing Alpine variable binding`);
    const identity = variant.version.scheme === 'alpine' ? alpine : variant.version.scheme === 'app'
      ? variant.version.app : `${variant.version.app}-alpine-${alpine}`;
    const prefix = variant.name === 'default' ? '' : `${variant.name}-`;
    const tag = `${prefix}${identity}-r${variant.version.revision}`;
    if (tag.length > 128) throw new Error(`${id}: tag exceeds 128 characters`);
    const aliasTags = (variant.aliases ?? []).map((template) => {
      const alias = template.replace(/\$\{(alpine|app)\}/g, (_, field: string) => {
        const value = field === 'alpine' ? alpine : variant.version.app;
        if (!value) throw new Error(`${id}: alias ${template} requires ${field}`);
        return value;
      });
      if (!tagPattern.test(alias) || /-r\d+$/.test(alias)) throw new Error(`${id}: invalid alias ${alias}; -rN is reserved for canonical tags`);
      return alias;
    });
    const repository = `${manifest.registry}/${variant.image}`;
    const release: Release = {
      ...variant, id, alpine, tag, repository, ref: `${repository}:${tag}`, aliasTags, source: manifest.source, dependencies,
    };
    resolved.set(id, release);
    visiting.pop();
    return release;
  };
  for (const id of variants.keys()) visit(id);
  const releases = [...resolved.values()];
  const refs = releases.flatMap((release) => [release.ref, ...release.aliasTags.map((alias) => `${release.repository}:${alias}`)]);
  if (new Set(refs).size !== refs.length) throw new Error('canonical or alias tag collision');
  return releases;
}

export function loadReleases(root: string, file = 'manifest.yaml'): Release[] {
  return resolveManifest(parseManifest(readFileSync(path.resolve(root, file), 'utf8')));
}

export function selectRelease(releases: Release[], selector: string): Release {
  const matches = releases.filter((release) => release.id === selector || release.image === selector);
  if (matches.length !== 1) throw new Error(matches.length ? `ambiguous image ${selector}; use image.variant` : `unknown image ${selector}`);
  return matches[0];
}

/** Selectors are image or image.variant IDs only; option-like input such as --push is rejected. */
export function validateSelectors(selectors: string[]) {
  for (const selector of selectors) {
    if (!/^[a-z0-9][a-z0-9._-]*$/.test(selector)) throw new Error(`invalid image selector ${JSON.stringify(selector)}`);
  }
}

/** Releases matching image or image.variant selectors, without dependencies. */
export function matchReleases(releases: Release[], selectors: string[]): Release[] {
  const ids = new Set(selectors.flatMap((selector) => {
    const matches = releases.filter((release) => release.image === selector || release.id === selector);
    if (!matches.length) throw new Error(`unknown image ${selector}`);
    return matches.map((release) => release.id);
  }));
  return releases.filter((release) => ids.has(release.id));
}

export function planReleases(releases: Release[], selectors: string[]): Release[] {
  if (!selectors.length) return releases;
  const affected = new Set(matchReleases(releases, selectors).map((release) => release.id));
  for (const release of releases) {
    if (release.dependencies.some((id) => affected.has(id))) affected.add(release.id);
  }
  const needed = new Set(affected);
  for (const release of [...releases].reverse()) {
    if (needed.has(release.id)) for (const dep of release.dependencies) needed.add(dep);
  }
  return releases.filter((release) => needed.has(release.id));
}

export function versionVariables(release: Release): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [field, variable] of Object.entries(release.build.variables)) {
    const value = field === 'alpine' ? release.alpine : field === 'app' ? release.version.app : release.version.revision;
    if (value === undefined) throw new Error(`${release.id}: missing value for ${field}`);
    result[variable] = String(value);
  }
  if (release.alpine) result.ALPINE_VERSION = release.alpine.split('.').slice(0, 2).join('.');
  return result;
}

export async function inspectBake(root: string, release: Release): Promise<BakePrint> {
  const dir = path.resolve(root, release.build.dir);
  for (const file of ['Makefile', 'docker-bake.hcl']) {
    if (!existsSync(path.join(dir, file))) throw new Error(`${release.id}: missing ${release.build.dir}/${file}`);
  }
  const args = Object.entries(versionVariables(release)).map(([key, value]) => `${key}=${value}`);
  // Make echoes nothing with -s; BuildKit progress goes to stderr, so stdout is the Bake JSON.
  const result = await capture(['make', '-s', '--no-print-directory', ...args,
    `DOCKER_BUILD_BAKE=docker buildx bake ${release.build.target}`, 'print'], { cwd: dir, timeoutMs: 30_000 });
  if (result.timedOut) throw new Error(`${release.id}: make print timed out after 30s`);
  if (result.exitCode !== 0) {
    const detail = lastErrorLine(result.stderr);
    throw new Error(`${release.id}: make print failed${detail ? `: ${detail}` : ''}`);
  }
  const bake = JSON.parse(result.stdout) as BakePrint;
  const target = bake.target?.[release.build.target];
  if (!target) throw new Error(`${release.id}: Bake target ${release.build.target} not found`);
  const context = target.context ?? '.';
  if (!existsSync(path.resolve(dir, context, target.dockerfile ?? 'Dockerfile'))) {
    throw new Error(`${release.id}: target Dockerfile not found`);
  }
  return bake;
}

export interface BakeOptions {
  platforms?: string[];
  revision?: string;
  /** Push target instead of the canonical GHCR ref (verification builds). */
  ref?: string;
  /** Internal dependency ID -> image ref, for parents built earlier in the same verification run. */
  dependencyRefs?: Map<string, string>;
}

export function generatedBake(bake: BakePrint, release: Release, releases: Release[], options: BakeOptions = {}): BakePrint {
  const source = bake.target?.[release.build.target];
  if (!source) throw new Error(`${release.id}: Bake target not found`);
  const contexts = { ...source.contexts };
  const args = { ...source.args, ...versionVariables(release) };
  for (const dep of [release.base, ...release.inputs].filter((item): item is Dependency => Boolean(item))) {
    const key = dep.context.replace(/\$\{(alpine|app)\}/g, (_, field: string) => {
      const value = field === 'alpine' ? release.alpine : release.version.app;
      if (!value) throw new Error(`${release.id}: context requires ${field}`);
      return value;
    });
    const id = internalId(dep);
    const ref = dep.ref ?? (id && options.dependencyRefs?.get(id)) ?? releases.find((item) => item.id === id)?.ref;
    if (!ref) throw new Error(`${release.id}: dependency ref not resolved`);
    contexts[key] = `docker-image://${ref}`;
    if (dep.arg) args[dep.arg] = key;
  }
  if (options.revision !== undefined && !/^[a-f0-9]{7,40}$/.test(options.revision)) {
    throw new Error(`${release.id}: invalid source revision`);
  }
  const labels: Record<string, string> = {
    ...(source.labels as Record<string, string> | undefined),
    'org.opencontainers.image.source': release.source,
    'org.opencontainers.image.version': release.tag,
    ...(options.revision ? { 'org.opencontainers.image.revision': options.revision } : {}),
  };
  return {
    group: { default: { targets: [release.build.target] } },
    target: { [release.build.target]: {
      ...source,
      args,
      contexts,
      labels,
      tags: [options.ref ?? release.ref],
      ...(options.platforms?.length ? { platforms: options.platforms } : {}),
    } },
  };
}

const platformPattern = /^linux\/(?:amd64|arm64|386|arm\/v[67]|ppc64le|s390x|riscv64)$/;

export function parsePlatforms(value: string | undefined): string[] | undefined {
  if (!value?.trim()) return undefined;
  const platforms = [...new Set(value.split(',').map((item) => item.trim()).filter(Boolean))];
  for (const platform of platforms) {
    if (!platformPattern.test(platform)) throw new Error(`unsupported platform ${platform}`);
  }
  return platforms;
}

/**
 * Verification builds push to a throwaway registry on the runner, never to a shared one.
 * Only loopback addresses are accepted, so a typo cannot redirect images elsewhere.
 */
export function parseLocalRegistry(value: string): string {
  if (!/^(?:localhost|127\.0\.0\.1):\d{2,5}$/.test(value)) throw new Error(`verify registry must be localhost:<port>, got ${value}`);
  return value;
}

/** Rewrite a canonical ref onto the local registry, keeping repository path and tag. */
export function localRef(ref: string, registry: string): string {
  const slash = ref.indexOf('/');
  if (slash < 0) throw new Error(`invalid image ref ${ref}`);
  return `${registry}${ref.slice(slash)}`;
}

/** Alias refs of a release in its own repository, or rewritten onto the local verification registry. */
export function aliasRefs(release: Release, registry?: string): string[] {
  return release.aliasTags.map((alias) => {
    const ref = `${release.repository}:${alias}`;
    return registry ? localRef(ref, registry) : ref;
  });
}

/** Target namespace for copies outside GHCR, e.g. docker.io/wener or quay.io/wener. */
export function parseNamespace(value: string): string {
  if (!/^[a-z0-9-]+(?:\.[a-z0-9-]+)+(?::\d+)?\/[a-z0-9]+(?:[._-][a-z0-9]+)*$/.test(value)) {
    throw new Error(`target must be <registry>/<namespace>, e.g. docker.io/wener; got ${value}`);
  }
  return value;
}

export interface TagSync { ref: string; digest: string; action: 'current' | 'updated' | 'would update' }

/**
 * Point every target tag at `repository@digest`. Tags already on that digest are left alone.
 * imagetools copies the index unchanged, so targets end up with the same digest; this is verified after writing.
 * Unknown registry state stops the sync instead of overwriting a tag that might be fine.
 */
export async function syncTags(repository: string, digest: string, targets: string[], write: boolean): Promise<TagSync[]> {
  const states = await Promise.all(targets.map(async (ref) => ({ ref, publication: await inspectPublication(ref) })));
  for (const { ref, publication } of states) {
    if (publication.state !== 'published' && publication.state !== 'missing') {
      throw new Error(`${ref}: ${publication.detail ?? `registry state ${publication.state}`}`);
    }
  }
  const stale = states.filter((state) => state.publication.digest !== digest).map((state) => state.ref);
  if (write && stale.length) {
    await run(['docker', 'buildx', 'imagetools', 'create', ...stale.flatMap((ref) => ['--tag', ref]), `${repository}@${digest}`], {
      timeoutMs: 60 * 60_000,
    });
    for (const ref of stale) {
      const written = await inspectPublication(ref);
      if (written.digest !== digest) throw new Error(`${ref}: expected ${digest}, registry reports ${written.digest ?? written.state}`);
    }
  }
  return states.map(({ ref, publication }) => ({
    ref, digest, action: publication.digest === digest ? 'current' : write ? 'updated' : 'would update',
  }));
}

/** Missing tags are built; existing canonical tags are immutable; unknown registry state stops publishing. */
export function publishAction(publication: Publication): 'build' | 'skip' {
  if (publication.state === 'missing') return 'build';
  if (publication.state === 'published') return 'skip';
  throw new Error(publication.detail ?? `registry state ${publication.state}; refusing to publish`);
}

/** Bake resolves relative local contexts from the working directory; pin them before writing a temporary file. */
export function executionBake(bake: BakePrint, dir: string): BakePrint {
  const copy = structuredClone(bake);
  for (const target of Object.values(copy.target ?? {})) {
    target.context = path.resolve(dir, target.context ?? '.');
    for (const [key, value] of Object.entries(target.contexts ?? {})) {
      if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(value) && !value.startsWith('target:')) {
        target.contexts![key] = path.resolve(dir, value);
      }
    }
  }
  return copy;
}

// Build logs go to stderr so stdout stays a clean result table.
export async function prepareBuild(root: string, release: Release) {
  if (!release.build.prepare) return;
  const args = Object.entries(versionVariables(release)).map(([key, value]) => `${key}=${value}`);
  await run(['make', '--no-print-directory', ...args, release.build.prepare], {
    cwd: path.resolve(root, release.build.dir), timeoutMs: 30 * 60_000,
  });
}

export async function pushBake(root: string, release: Release, bake: BakePrint) {
  const dir = path.resolve(root, release.build.dir);
  const temp = mkdtempSync(path.join(tmpdir(), 'dockerfiles-bake-'));
  try {
    const file = path.join(temp, 'docker-bake.json');
    writeFileSync(file, JSON.stringify(executionBake(bake, dir), null, 2));
    await run(['docker', 'buildx', 'bake', '--file', file, '--push', release.build.target], { cwd: dir, timeoutMs: 4 * 60 * 60_000 });
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
}

export function registryFailure(message: string): Publication {
  if (/unauthorized|denied|forbidden|insufficient_scope|authentication required|\b40[13]\b/i.test(message)) {
    return { state: 'inaccessible', detail: 'registry authentication or permission required' };
  }
  if (/manifest[ _]unknown|name[ _]unknown|no such manifest|not found|\b404\b/i.test(message)) return { state: 'missing' };
  return { state: 'error', detail: 'registry query failed; image existence is unknown' };
}

export async function inspectPublication(ref: string): Promise<Publication> {
  const result = await capture(['docker', 'buildx', 'imagetools', 'inspect', '--format', '{{json .}}', ref], { timeoutMs: 25_000 });
  if (result.timedOut || result.exitCode === 127) return { state: 'error', detail: 'registry command unavailable or timed out' };
  if (result.exitCode !== 0) return registryFailure(result.stderr);
  try {
    const digest = JSON.parse(result.stdout)?.manifest?.digest;
    if (typeof digest === 'string' && /^sha256:[a-f0-9]{64}$/.test(digest)) return { state: 'published', digest };
  } catch {
    // fall through: unparsable output means the state is unknown
  }
  return { state: 'error', detail: 'registry returned no manifest digest' };
}

export function graph(releases: Release[]): string {
  const ids = new Map(releases.map((release, index) => [release.id, `i${index}`]));
  const lines = ['flowchart LR'];
  for (const release of releases) lines.push(`    ${ids.get(release.id)}["${release.id}<br/>${release.tag}"]`);
  for (const release of releases) {
    for (const dep of release.dependencies) lines.push(`    ${ids.get(dep)} --> ${ids.get(release.id)}`);
  }
  return lines.join('\n');
}

export function replaceReadmeRegion(source: string, body: string): string {
  const count = (marker: string) => source.split(marker).length - 1;
  if (count(regionStart) !== 1 || count(regionEnd) !== 1 || source.indexOf(regionStart) > source.indexOf(regionEnd)) {
    throw new Error('README must contain exactly one ordered GENERATED IMAGES region');
  }
  return source.slice(0, source.indexOf(regionStart) + regionStart.length)
    + `\n\n${body.trim()}\n\n` + source.slice(source.indexOf(regionEnd));
}
