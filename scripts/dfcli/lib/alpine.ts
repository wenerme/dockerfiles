import { isDeepStrictEqual } from 'node:util';
import { matchReleases, parseManifest, resolveManifest, type ImageManifest, type ManifestVariant, type Release } from './manifest.ts';

const releaseVersion = /^(\d+)\.(\d+)\.(\d+)$/;

/** Latest patch release of each stable Alpine branch, keyed by `major.minor`. */
export type AlpineBranches = Map<string, string>;

function versionParts(version: string): number[] {
  const match = releaseVersion.exec(version);
  if (!match) throw new Error(`invalid Alpine version ${version}`);
  return match.slice(1).map(Number);
}

export function compareVersions(a: string, b: string): number {
  const [x, y] = [versionParts(a), versionParts(b)];
  for (let index = 0; index < 3; index += 1) {
    if (x[index] !== y[index]) return x[index] - y[index];
  }
  return 0;
}

export function alpineBranch(version: string): string {
  return versionParts(version).slice(0, 2).join('.');
}

/** Parse https://alpinelinux.org/releases.json; edge and malformed entries are ignored, not trusted for order. */
export function parseAlpineReleases(data: unknown): AlpineBranches {
  const branches: AlpineBranches = new Map();
  const list = (data as { release_branches?: unknown })?.release_branches;
  if (!Array.isArray(list)) throw new Error('Alpine releases: missing release_branches');
  for (const entry of list as { rel_branch?: unknown; releases?: { version?: unknown }[] }[]) {
    const branch = typeof entry?.rel_branch === 'string' ? /^v(\d+\.\d+)$/.exec(entry.rel_branch)?.[1] : undefined;
    if (!branch || !Array.isArray(entry.releases)) continue;
    for (const release of entry.releases) {
      const version = release?.version;
      if (typeof version !== 'string' || !releaseVersion.test(version) || alpineBranch(version) !== branch) continue;
      const current = branches.get(branch);
      if (!current || compareVersions(version, current) > 0) branches.set(branch, version);
    }
  }
  if (!branches.size) throw new Error('Alpine releases: no stable branch found');
  return branches;
}

export async function fetchAlpineBranches(url = 'https://alpinelinux.org/releases.json'): Promise<AlpineBranches> {
  const response = await fetch(url, { signal: AbortSignal.timeout(20_000) });
  if (!response.ok) throw new Error(`Alpine releases: HTTP ${response.status} from ${url}`);
  return parseAlpineReleases(await response.json());
}

export interface ManifestChange {
  id: string;
  from: { alpine?: string; revision: number; tag: string };
  to: { alpine?: string; revision: number; tag: string };
  reason: string;
}

export interface ManifestUpdatePlan {
  manifest: ImageManifest;
  changes: ManifestChange[];
  notes: string[];
}

function variantIndex(manifest: ImageManifest): Map<string, ManifestVariant> {
  return new Map(manifest.images.flatMap((image) => image.variants.map((variant) => [`${image.name}.${variant.name}`, variant] as const)));
}

const identity = (tag: string) => tag.replace(/-r\d+$/, '');

/**
 * Settle revisions of `draft` (a copy of `source` with edited versions) along the dependency graph.
 * A variant is affected when it is a seed, its Alpine or app version changed, or one of its parents was affected.
 * An affected variant whose canonical identity changed starts again at r0; one whose identity is unchanged
 * (e.g. pdns, tagged by app version only) gets revision + 1 so the existing tag is not mistaken as current.
 */
export function propagateRevisions(source: ImageManifest, draft: ImageManifest, seeds: Iterable<string> = []): ManifestChange[] {
  const variants = variantIndex(draft);
  const before = new Map(resolveManifest(source).map((release) => [release.id, release]));
  const seeded = new Set(seeds);
  for (const id of seeded) {
    if (!variants.has(id) || !before.has(id)) throw new Error(`unknown variant ${id}`);
  }
  const reasons = new Map<string, string>();
  // resolveManifest returns dependency order, so every parent is settled before its dependents.
  for (const release of resolveManifest(draft)) {
    const previous = before.get(release.id);
    if (!previous) continue; // a new variant keeps its declared revision
    const parents = release.dependencies.filter((id) => reasons.has(id));
    // Compare resolved values: an inherited Alpine change is reported as the parent change that caused it.
    const reason = release.version.app !== previous.version.app ? `app ${previous.version.app} -> ${release.version.app}`
      : parents.length ? `parent changed: ${parents.join(', ')}`
      : release.alpine !== previous.alpine ? `Alpine ${previous.alpine} -> ${release.alpine}`
      : seeded.has(release.id) ? 'revision bump' : undefined;
    if (!reason) continue;
    reasons.set(release.id, reason);
    variants.get(release.id)!.version.revision = identity(release.tag) === identity(previous.tag) ? previous.version.revision + 1 : 0;
  }
  return resolveManifest(draft).filter((release) => reasons.has(release.id)).map((release) => ({
    id: release.id, from: snapshot(before.get(release.id)!), to: snapshot(release), reason: reasons.get(release.id)!,
  }));
}

/** Bump the selected variants (image or image.variant) and every dependent, e.g. after a base image content change. */
export function planRevisionBump(source: ImageManifest, selectors: string[]): ManifestUpdatePlan {
  if (!selectors.length) throw new Error('select at least one image or variant to bump');
  const seeds = matchReleases(resolveManifest(source), selectors).map((release) => release.id);
  const manifest = structuredClone(source);
  return { manifest, changes: propagateRevisions(source, manifest, seeds), notes: [] };
}

/**
 * Move explicit Alpine versions to the newest patch on their branch and propagate revisions down the graph.
 * Variants pinned to an external parent are reported, not changed: their Alpine follows the published parent.
 */
export function planAlpineUpdate(source: ImageManifest, branches: AlpineBranches): ManifestUpdatePlan {
  const manifest = structuredClone(source);
  const variants = variantIndex(manifest);
  const newest = [...branches.values()].sort(compareVersions).at(-1)!;
  const notes: string[] = [];
  for (const release of resolveManifest(source)) {
    const current = release.version.alpine;
    if (!current) continue;
    const latest = branches.get(alpineBranch(current));
    if (!latest) {
      notes.push(`${release.id}: Alpine ${alpineBranch(current)} is no longer listed upstream; staying on ${current}`);
      continue;
    }
    if (release.base?.ref) {
      if (compareVersions(latest, current) > 0 && alpineBranch(latest) === alpineBranch(newest)) {
        notes.push(`${release.id}: Alpine ${latest} is available; publish a new pinned parent first (${release.base.ref.split('@')[0]})`);
      }
      continue;
    }
    if (compareVersions(latest, current) > 0) variants.get(release.id)!.version.alpine = latest;
    if (alpineBranch(newest) !== alpineBranch(current)) {
      notes.push(`${release.id}: Alpine ${alpineBranch(newest)} is available; branch upgrades are manual`);
    }
  }
  return { manifest, changes: propagateRevisions(source, manifest), notes };
}

function snapshot(release: Release) {
  return { alpine: release.alpine, revision: release.version.revision, tag: release.tag };
}

// ── Comment-preserving manifest edits ─────────────────────────────────────────

interface Block { start: number; end: number; indent: number }

const indentOf = (line: string) => line.length - line.trimStart().length;
const meaningful = (line: string) => line.trim() !== '' && !line.trimStart().startsWith('#');

/** List items `- ` at the first item indent within lines (start, end]. */
function listItems(lines: string[], start: number, end: number): Block[] {
  let indent: number | undefined;
  const starts: number[] = [];
  for (let index = start + 1; index < end; index += 1) {
    const line = lines[index];
    if (!meaningful(line)) continue;
    if (indent === undefined) {
      if (!line.trimStart().startsWith('- ')) throw new Error(`manifest edit: expected list at line ${index + 1}`);
      indent = indentOf(line);
    }
    if (indentOf(line) < indent) break;
    if (indentOf(line) === indent && line.trimStart().startsWith('- ')) starts.push(index);
  }
  return starts.map((itemStart, position) => {
    let itemEnd = starts[position + 1] ?? end;
    // A dedent ends the last item.
    for (let index = itemStart + 1; index < itemEnd; index += 1) {
      if (meaningful(lines[index]) && indentOf(lines[index]) <= indent!) { itemEnd = index; break; }
    }
    return { start: itemStart, end: itemEnd, indent: indent! };
  });
}

function itemName(line: string): string {
  const match = /^\s*-\s+name:\s*(?:"([^"]*)"|'([^']*)'|([^\s#]+))\s*(?:#.*)?$/.exec(line);
  if (!match) throw new Error(`manifest edit: expected "- name:" as the first key, got ${JSON.stringify(line.trim())}`);
  return match[1] ?? match[2] ?? match[3];
}

/** Child mapping `key:` of an item; its content keys sit at the item indent + 2. */
function childBlock(lines: string[], item: Block, key: string): Block {
  const indent = item.indent + 2;
  for (let index = item.start + 1; index < item.end; index += 1) {
    if (indentOf(lines[index]) === indent && new RegExp(`^\\s*${key}:\\s*(?:#.*)?$`).test(lines[index])) {
      let end = item.end;
      for (let next = index + 1; next < item.end; next += 1) {
        if (meaningful(lines[next]) && indentOf(lines[next]) <= indent) { end = next; break; }
      }
      return { start: index, end, indent };
    }
  }
  throw new Error(`manifest edit: ${key} block not found near line ${item.start + 1}`);
}

function setField(lines: string[], block: Block, field: 'alpine' | 'revision', value: string | number) {
  const pattern = new RegExp(`^(\\s*${field}:\\s*)(?:"[^"]*"|'[^']*'|[^\\s#]+)(\\s*(?:#.*)?)$`);
  for (let index = block.start + 1; index < block.end; index += 1) {
    const line = lines[index];
    if (indentOf(line) === block.indent + 2 && pattern.test(line)) {
      lines[index] = line.replace(pattern, `$1${field === 'alpine' ? JSON.stringify(value) : value}$2`);
      return;
    }
  }
  throw new Error(`manifest edit: version.${field} not found near line ${block.start + 1}`);
}

/**
 * Apply alpine/revision changes from `next` to the YAML text, keeping comments and layout.
 * The result is re-parsed and must equal `next` exactly, so an unexpected layout fails instead of writing a wrong file.
 */
export function renderManifestUpdate(source: string, next: ImageManifest): string {
  const current = parseManifest(source);
  const lines = source.split('\n');
  const imagesLine = lines.findIndex((line) => /^images:\s*(?:#.*)?$/.test(line));
  if (imagesLine < 0) throw new Error('manifest edit: top-level images list not found');
  const images = listItems(lines, imagesLine, lines.length);
  for (const [imageIndex, image] of current.images.entries()) {
    const imageBlock = images[imageIndex];
    if (!imageBlock || itemName(lines[imageBlock.start]) !== image.name) throw new Error(`manifest edit: image ${image.name} not located`);
    const variantsBlock = childBlock(lines, imageBlock, 'variants');
    const variantBlocks = listItems(lines, variantsBlock.start, variantsBlock.end);
    for (const [variantIndex, variant] of image.variants.entries()) {
      const target = next.images[imageIndex]?.variants[variantIndex];
      const block = variantBlocks[variantIndex];
      if (!target || target.name !== variant.name || !block || itemName(lines[block.start]) !== variant.name) {
        throw new Error(`manifest edit: variant ${image.name}.${variant.name} not located`);
      }
      const version = childBlock(lines, block, 'version');
      if (target.version.alpine !== variant.version.alpine) {
        if (!target.version.alpine || !variant.version.alpine) {
          throw new Error(`${image.name}.${variant.name}: adding or removing version.alpine is a manual edit`);
        }
        setField(lines, version, 'alpine', target.version.alpine);
      }
      if (target.version.revision !== variant.version.revision) setField(lines, version, 'revision', target.version.revision);
    }
  }
  const output = lines.join('\n');
  if (!isDeepStrictEqual(parseManifest(output), next)) throw new Error('manifest edit: rewritten manifest does not match the planned update');
  return output;
}
