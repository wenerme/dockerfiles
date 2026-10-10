import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { rel, root, trackedFiles } from './repo.ts';

export interface TargetInfo {
  name: string;
  context?: string;
  dockerfile?: string;
  platforms: string[];
  tags: string[];
  contexts: string[];
  inherits: string[];
  hasTags: boolean;
  isLatest: boolean;
}

export interface ImageInfo {
  name: string;
  dir: string;
  bakePath: string;
  variables: Record<string, string>;
  defaultTargets: string[];
  targets: TargetInfo[];
  dockerfiles: string[];
  fromImages: string[];
  registries: string[];
  hasGhcr: boolean;
  readme?: string;
}

function unquote(value: string) {
  const trimmed = value.trim();
  return trimmed.startsWith('"') && trimmed.endsWith('"') ? trimmed.slice(1, -1) : trimmed;
}

export function findBlock(text: string, re: RegExp) {
  const match = re.exec(text);
  if (!match || match.index == null) return undefined;
  const open = text.indexOf('{', match.index);
  if (open < 0) return undefined;
  let depth = 0;
  for (let i = open; i < text.length; i++) {
    if (text[i] === '{') depth++;
    if (text[i] === '}') depth--;
    if (depth === 0) return text.slice(open + 1, i);
  }
  return undefined;
}

export function parseVariables(text: string) {
  const variables: Record<string, string> = {};
  for (const match of text.matchAll(/variable\s+"?([A-Za-z0-9_]+)"?\s*\{/g)) {
    const block = findBlock(text.slice(match.index), /^variable\s+"?[A-Za-z0-9_]+"?/);
    const value = block?.match(/^\s*default\s*=\s*(.+?)\s*$/m)?.[1];
    if (value) variables[match[1]] = unquote(value);
  }
  return variables;
}

function parseListAssignment(block: string, key: string) {
  const match = new RegExp(`${key}\\s*=\\s*\\[([\\s\\S]*?)\\]`, 'm').exec(block);
  return match ? Array.from(match[1].matchAll(/"([^"]+)"/g)).map((item) => item[1]) : [];
}

function parseStringAssignment(block: string, key: string) {
  return new RegExp(`${key}\\s*=\\s*"([^"]+)"`, 'm').exec(block)?.[1];
}

function parseMapKeys(block: string, key: string) {
  const map = findBlock(block, new RegExp(`${key}\\s*=`));
  return map ? Array.from(map.matchAll(/"([^"]+)"\s*[:=]/g)).map((item) => item[1]) : [];
}

function parseDefaultTargets(text: string) {
  const block = findBlock(text, /group\s+"default"/);
  return block ? parseListAssignment(block, 'targets') : [];
}

export function parseTargets(text: string): TargetInfo[] {
  const targets: TargetInfo[] = [];
  for (const match of text.matchAll(/target\s+"?([A-Za-z0-9_.-]+)"?\s*\{/g)) {
    const block = findBlock(text.slice(match.index), /^target\s+"?[A-Za-z0-9_.-]+"?/);
    if (!block) continue;
    targets.push({
      name: match[1],
      context: parseStringAssignment(block, 'context'),
      dockerfile: parseStringAssignment(block, 'dockerfile'),
      platforms: parseListAssignment(block, 'platforms'),
      tags: parseListAssignment(block, 'tags'),
      contexts: parseMapKeys(block, 'contexts'),
      inherits: parseListAssignment(block, 'inherits'),
      hasTags: /^\s*tags\s*=/m.test(block),
      isLatest: /^\s*tags\s*=\s*tags\(\s*"latest"/m.test(block),
    });
  }
  return targets;
}

/** External FROM images; references to earlier build stages are excluded. */
export function parseFromImages(texts: string[]) {
  const out = new Set<string>();
  for (const text of texts) {
    const from = [...text.matchAll(/^FROM\s+(?:--platform=\S+\s+)?([^\s]+)(?:\s+AS\s+(\S+))?/gim)];
    const stages = new Set(from.map((match) => match[2]?.toLowerCase()).filter(Boolean));
    for (const match of from) {
      if (!stages.has(match[1].toLowerCase())) out.add(match[1]);
    }
  }
  return Array.from(out).sort();
}

function parseRegistries(text: string) {
  const regs = [
    ['Docker Hub', /docker\.io\/wener\//],
    ['Quay', /quay\.io\/wener\//],
    ['GHCR', /ghcr\.io\/wenerme\/dockerfiles\//],
  ] as const;
  return regs.filter(([, re]) => re.test(text)).map(([name]) => name);
}

/** Dockerfiles up to three levels below an image directory. */
function dockerfilesUnder(files: string[], dir: string) {
  return files.filter((file) => {
    if (path.basename(file) !== 'Dockerfile' || file.split('/').includes('node_modules')) return false;
    const relative = path.relative(dir, path.dirname(file));
    if (relative.startsWith('..') || path.isAbsolute(relative)) return false;
    return relative.split(path.sep).filter(Boolean).length <= 3;
  }).sort();
}

export async function scanImages(): Promise<ImageInfo[]> {
  const files = await trackedFiles();
  const bakePaths = files.filter((file) => file.endsWith('/docker-bake.hcl')).sort();
  return bakePaths.map((bakePath): ImageInfo => {
    const dir = path.dirname(bakePath);
    const text = readFileSync(path.join(root, bakePath), 'utf8');
    const variables = parseVariables(text);
    const dockerfiles = dockerfilesUnder(files, dir);
    const registries = parseRegistries(text);
    const readmePath = path.join(root, dir, 'README.md');
    return {
      name: variables.IMAGE_NAME || path.basename(dir),
      dir,
      bakePath,
      variables,
      defaultTargets: parseDefaultTargets(text),
      targets: parseTargets(text),
      dockerfiles,
      fromImages: parseFromImages(dockerfiles.map((file) => readFileSync(path.join(root, file), 'utf8'))),
      registries,
      hasGhcr: registries.includes('GHCR'),
      readme: existsSync(readmePath) ? rel(readmePath) : undefined,
    };
  });
}

export function findImage(images: ImageInfo[], ref: string) {
  return images.find((image) => image.dir === ref || image.bakePath === ref || `${ref}/docker-bake.hcl` === image.bakePath)
    ?? images.find((image) => image.name === ref || path.basename(image.dir) === ref);
}

function resolveVariableValue(value: string, variables: Record<string, string>, seen = new Set<string>()): string {
  const direct = value.match(/^[A-Za-z_][A-Za-z0-9_]*$/)?.[0];
  if (direct && variables[direct] && !seen.has(direct)) {
    seen.add(direct);
    return resolveVariableValue(variables[direct], variables, seen);
  }
  return value.replace(/\$\{([A-Za-z_][A-Za-z0-9_]*)\}/g, (_, key: string) => {
    if (!variables[key] || seen.has(key)) return `\${${key}}`;
    seen.add(key);
    return resolveVariableValue(variables[key], variables, seen);
  });
}

export function resolveFromImage(image: string, variables: Record<string, string>) {
  return resolveVariableValue(image, variables).replace(/\$([A-Za-z_][A-Za-z0-9_]*)/g, (_, key: string) =>
    variables[key] ? resolveVariableValue(variables[key], variables) : `$${key}`);
}

function isExternalImage(image: string) {
  if (!image || image === 'scratch') return false;
  if (image.includes('$') || image.includes('{') || image.includes('}')) return false;
  return image.includes('/') || image.includes(':') || image.includes('@');
}

export function resolvedBaseImages(info: ImageInfo) {
  return [...new Set(info.fromImages.map((image) => resolveFromImage(image, info.variables)).filter(isExternalImage))].sort();
}
