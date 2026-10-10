import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { Command } from 'commander';
import {
  generatedBake, graph, inspectBake, inspectPublication, loadReleases, parsePlatforms, planReleases, prepareBuild,
  publishAction, pushBake, renderManifestTable, replaceReadmeRegion, selectRelease, type Publication,
} from './lib/image-manifest.ts';

const root = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();

interface TargetInfo {
  name: string;
  context?: string;
  dockerfile?: string;
  platforms: string[];
  tags: string[];
  contexts: string[];
}

interface ImageInfo {
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

interface BaseDigestState {
  images: Record<string, {
    baseImages: Record<string, string>;
    updatedAt?: string;
  }>;
}

interface BakeTargetPrint {
  target?: Record<string, {
    tags?: string[];
  }>;
}

function readText(file: string) {
  return readFileSync(file, 'utf8');
}

function rel(file: string) {
  return path.relative(root, file) || '.';
}

function listBakeFiles() {
  const files = execFileSync('git', ['ls-files', '**/docker-bake.hcl'], { cwd: root, encoding: 'utf8' })
    .split('\n')
    .filter(Boolean);
  return files.map((file) => path.join(root, file)).sort();
}

// Only tracked Dockerfiles count, so local scratch files cannot change generated output or CI checks.
function findDockerfiles(dir: string) {
  const relativeDir = rel(dir);
  return execFileSync('git', ['ls-files', '--', relativeDir], { cwd: root, encoding: 'utf8' })
    .split('\n')
    .filter((file) => path.basename(file) === 'Dockerfile')
    .filter((file) => {
      const depth = path.relative(relativeDir, path.dirname(file)).split(path.sep).filter(Boolean).length;
      return depth <= 3 && !file.split('/').includes('node_modules');
    })
    .sort();
}

function parseVariables(text: string) {
  const variables: Record<string, string> = {};
  const re = /variable\s+"?([A-Za-z0-9_]+)"?\s*\{/g;
  for (const match of text.matchAll(re)) {
    const block = findBlock(text.slice(match.index), /^variable\s+"?[A-Za-z0-9_]+"?/);
    const value = block?.match(/^\s*default\s*=\s*(.+?)\s*$/m)?.[1];
    if (value) {
      variables[match[1]] = unquote(value);
    }
  }
  return variables;
}

function unquote(value: string) {
  const trimmed = value.trim();
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function findBlock(text: string, re: RegExp) {
  const match = re.exec(text);
  if (!match || match.index == null) return undefined;
  const open = text.indexOf('{', match.index);
  if (open < 0) return undefined;
  let depth = 0;
  for (let i = open; i < text.length; i++) {
    const char = text[i];
    if (char === '{') depth++;
    if (char === '}') depth--;
    if (depth === 0) return text.slice(open + 1, i);
  }
  return undefined;
}

function parseListAssignment(block: string, key: string) {
  const re = new RegExp(`${key}\\s*=\\s*\\[([\\s\\S]*?)\\]`, 'm');
  const match = re.exec(block);
  if (!match) return [];
  return Array.from(match[1].matchAll(/"([^"]+)"/g)).map((item) => item[1]);
}

function parseStringAssignment(block: string, key: string) {
  const re = new RegExp(`${key}\\s*=\\s*"([^"]+)"`, 'm');
  return re.exec(block)?.[1];
}

function parseMapKeys(block: string, key: string) {
  const map = findBlock(block, new RegExp(`${key}\\s*=`));
  if (!map) return [];
  return Array.from(map.matchAll(/"([^"]+)"\s*[:=]/g)).map((item) => item[1]);
}

function parseDefaultTargets(text: string) {
  const block = findBlock(text, /group\s+"default"/);
  return block ? parseListAssignment(block, 'targets') : [];
}

function parseTargets(text: string) {
  const targets: TargetInfo[] = [];
  const re = /target\s+"?([A-Za-z0-9_.-]+)"?\s*\{/g;
  for (const match of text.matchAll(re)) {
    const block = findBlock(text.slice(match.index), /^target\s+"?[A-Za-z0-9_.-]+"?/);
    if (!block) continue;
    targets.push({
      name: match[1],
      context: parseStringAssignment(block, 'context'),
      dockerfile: parseStringAssignment(block, 'dockerfile'),
      platforms: parseListAssignment(block, 'platforms'),
      tags: parseListAssignment(block, 'tags'),
      contexts: parseMapKeys(block, 'contexts'),
    });
  }
  return targets;
}

function parseFromImages(dockerfiles: string[]) {
  const out = new Set<string>();
  for (const file of dockerfiles) {
    const abs = path.join(root, file);
    if (!existsSync(abs)) continue;
    const text = readText(abs);
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

function scanImages() {
  return listBakeFiles().map((bakePath): ImageInfo => {
    const dir = path.dirname(bakePath);
    const text = readText(bakePath);
    const variables = parseVariables(text);
    const dockerfiles = findDockerfiles(dir);
    const readmePath = path.join(dir, 'README.md');
    const registries = parseRegistries(text);
    return {
      name: variables.IMAGE_NAME || path.basename(dir),
      dir: rel(dir),
      bakePath: rel(bakePath),
      variables,
      defaultTargets: parseDefaultTargets(text),
      targets: parseTargets(text),
      dockerfiles,
      fromImages: parseFromImages(dockerfiles),
      registries,
      hasGhcr: registries.includes('GHCR'),
      readme: existsSync(readmePath) ? rel(readmePath) : undefined,
    };
  });
}

function findImage(images: ImageInfo[], ref: string) {
  const exact = images.find((image) => image.dir === ref || image.bakePath === ref || `${ref}/docker-bake.hcl` === image.bakePath);
  if (exact) return exact;
  return images.find((image) => image.name === ref || path.basename(image.dir) === ref);
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

function resolveFromImage(image: string, variables: Record<string, string>) {
  return resolveVariableValue(image, variables).replace(/\$([A-Za-z_][A-Za-z0-9_]*)/g, (_, key: string) => {
    return variables[key] ? resolveVariableValue(variables[key], variables) : `$${key}`;
  });
}

function isExternalImage(image: string) {
  if (!image || image === 'scratch') return false;
  if (image.includes('$') || image.includes('{') || image.includes('}')) return false;
  if (!image.includes('/') && !image.includes(':') && !image.includes('@')) return false;
  return true;
}

function resolvedBaseImages(info: ImageInfo) {
  return Array.from(new Set(info.fromImages.map((image) => resolveFromImage(image, info.variables)).filter(isExternalImage))).sort();
}

function inspectImageDigest(image: string) {
  const output = execFileSync('docker', ['buildx', 'imagetools', 'inspect', '--format', '{{json .}}', image], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const data = JSON.parse(output);
  const digest = data?.manifest?.digest;
  if (!digest || typeof digest !== 'string') {
    throw new Error(`missing digest for ${image}`);
  }
  return digest;
}

function imageExists(image: string) {
  try {
    execFileSync('docker', ['buildx', 'imagetools', 'inspect', image], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function bakePrint(workdir: string, target: string): BakeTargetPrint {
  const output = execFileSync('docker', ['buildx', 'bake', '--print', target], {
    cwd: workdir,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  return JSON.parse(output);
}

function chooseCanonicalTag(tags: string[]) {
  return tags.findLast((tag) => /-alpine-[0-9.]+-r[0-9]+$/.test(tag)) || tags.findLast((tag) => /-r[0-9]+$/.test(tag));
}

function appendGithubOutput(file: string, values: Record<string, string | boolean>, multiline: Record<string, string[]>) {
  const lines: string[] = [];
  for (const [key, value] of Object.entries(values)) {
    lines.push(`${key}=${value}`);
  }
  for (const [key, value] of Object.entries(multiline)) {
    lines.push(`${key}<<EOF`);
    lines.push(...value);
    lines.push('EOF');
  }
  writeFileSync(file, `${lines.join('\n')}\n`, { flag: 'a' });
}

function prepareGhcrBake(
  images: ImageInfo[],
  imageRef: string,
  options: { target?: string; repository?: string; output?: string; force?: boolean; githubOutput?: string },
) {
  const info = findImage(images, imageRef);
  if (!info) throw new Error(`unknown image: ${imageRef}`);

  const target = options.target || info.defaultTargets[0] || info.targets[0]?.name;
  if (!target) throw new Error(`no target found for ${info.dir}`);

  const workdir = path.join(root, info.dir);
  const repository = options.repository || `ghcr.io/wenerme/dockerfiles/${info.name}`;
  const print = bakePrint(workdir, target);
  const allTags = print.target?.[target]?.tags || [];
  const tags = allTags.filter((tag) => tag.startsWith(`${repository}:`));
  if (!tags.length) {
    throw new Error(`no GHCR tags for ${repository} found in ${info.dir}/docker-bake.hcl target ${target}`);
  }

  const canonicalTag = chooseCanonicalTag(tags);
  if (!canonicalTag) {
    throw new Error(`no revisioned canonical tag found for ${repository}; tags: ${tags.join(', ')}`);
  }

  const output = options.output || 'docker-bake.ghcr.generated.hcl';
  const outputPath = path.isAbsolute(output) ? output : path.join(workdir, output);
  writeFileSync(outputPath, `target "${target}" {\n  tags = ${JSON.stringify(tags)}\n}\n`);

  const canonicalExists = imageExists(canonicalTag);
  const shouldBuild = !canonicalExists || Boolean(options.force) || process.env.FORCE_BUILD === 'true';
  const result = {
    image: info.name,
    dir: info.dir,
    target,
    repository,
    output: rel(outputPath),
    tags,
    canonicalTag,
    canonicalExists,
    shouldBuild,
  };

  const githubOutput = options.githubOutput || process.env.GITHUB_OUTPUT;
  if (githubOutput) {
    appendGithubOutput(githubOutput, {
      canonical_tag: canonicalTag,
      canonical_exists: canonicalExists,
      should_build: shouldBuild,
      output: rel(outputPath),
      target,
    }, { tags });
  }

  return result;
}

function readBaseDigestState(file: string): BaseDigestState {
  if (!existsSync(file)) return { images: {} };
  return JSON.parse(readText(file));
}

function writeJson(file: string, value: unknown) {
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function findRevisionVariable(info: ImageInfo, explicit?: string) {
  if (explicit) return explicit;
  for (const key of ['REV', 'PG_REVISION']) {
    if (info.variables[key] && /^\d+$/.test(info.variables[key])) return key;
  }
  return undefined;
}

function bumpRevision(info: ImageInfo, options: { variable?: string; write: boolean }) {
  const variable = findRevisionVariable(info, options.variable);
  if (!variable) {
    throw new Error(`no numeric revision variable found for ${info.name}; expected REV or PG_REVISION`);
  }

  const file = path.join(root, info.bakePath);
  const text = readText(file);
  const re = new RegExp(`(variable\\s+"?${variable}"?\\s*\\{[\\s\\S]*?default\\s*=\\s*")(\\d+)("[\\s\\S]*?\\})`);
  const match = re.exec(text);
  if (!match) {
    throw new Error(`could not locate default value for ${variable} in ${info.bakePath}`);
  }

  const before = Number(match[2]);
  const after = before + 1;
  if (options.write) {
    writeFileSync(file, text.replace(re, `$1${after}$3`));
  }
  return { variable, before, after, wrote: options.write };
}

function checkBaseDigests(
  images: ImageInfo[],
  imageRef: string,
  options: { write?: boolean; bump?: boolean; state?: string; revVar?: string },
) {
  const info = findImage(images, imageRef);
  if (!info) throw new Error(`unknown image: ${imageRef}`);

  const statePath = path.join(root, options.state || '.github/image-base-digests.json');
  const write = Boolean(options.write);
  const shouldBump = Boolean(options.bump);
  const bases = resolvedBaseImages(info);
  const state = readBaseDigestState(statePath);
  const previous = state.images[info.name]?.baseImages || {};
  const current: Record<string, string> = {};

  for (const base of bases) {
    current[base] = inspectImageDigest(base);
  }

  const changed = bases.filter((base) => previous[base] && previous[base] !== current[base]);
  const added = bases.filter((base) => !previous[base]);
  const removed = Object.keys(previous).filter((base) => !current[base]);
  let bump: ReturnType<typeof bumpRevision> | undefined;

  if (changed.length && shouldBump) {
    bump = bumpRevision(info, { variable: options.revVar, write });
  }

  const stateWritten = write && (changed.length > 0 || added.length > 0 || removed.length > 0 || !state.images[info.name]);
  if (stateWritten) {
    state.images[info.name] = { baseImages: current, updatedAt: new Date().toISOString() };
    writeJson(statePath, state);
  }

  console.log(JSON.stringify({ image: info.name, bases, changed, added, removed, bump, writeRequested: write, stateWritten, state: rel(statePath) }, null, 2));
}

function summarizeVersion(info: ImageInfo) {
  const keys = ['VERSION', 'REV', 'ALPINE_RELEASE', 'ALPINE_VERSION', 'GO_VERSION', 'GO_PACKAGE_VERSION',
    'PG_VERSION', 'PG_REVISION', 'NODE_VERSION', 'WORKSPACE_REV'];
  return keys
    .filter((key) => info.variables[key])
    .map((key) => `${key}=${info.variables[key]}`)
    .join('<br>');
}

function summarizeTargets(info: ImageInfo) {
  const defaults = info.defaultTargets.length ? info.defaultTargets : info.targets.map((target) => target.name);
  return defaults.length ? defaults.join(', ') : '-';
}

function summarizeBase(info: ImageInfo) {
  if (!info.fromImages.length) return '-';
  return info.fromImages.slice(0, 3).map((item) => `\`${resolveFromImage(item, info.variables)}\``).join('<br>') + (info.fromImages.length > 3 ? '<br>...' : '');
}

function summarizeRegistries(info: ImageInfo) {
  return info.registries.length ? info.registries.join(', ') : '-';
}

function generateReadme(images: ImageInfo[]) {
  const releases = loadReleases(root);
  const managedDirs = new Set(releases.map((release) => release.build.dir));
  const remaining = images.filter((image) => !managedDirs.has(image.dir));
  const rows = remaining.map((image) => {
    const imageName = `\`${image.name}\``;
    const dir = `[${image.dir}](${image.dir}/)`;
    return `| ${imageName} | ${dir} | ${summarizeTargets(image)} | ${summarizeVersion(image) || '-'} | ${summarizeRegistries(image)} | ${summarizeBase(image)} |`;
  });

  return `${renderManifestTable(releases)}

### 尚未迁移的 Bake 镜像清单

已跟踪的 Bake 配置共 ${images.length} 组，manifest 管理 ${releases.length} 个 variant；其余 ${remaining.length} 组列在下面。变量是 Bake 文件中的声明默认值，Makefile 或环境变量可能覆盖它们，不能作为已发布版本或运行时版本。

| Image | Directory | Default Targets | Version Variables | Registries | Base Images |
|---|---|---|---|---|---|
${rows.join('\n')}
`;
}

function printScan(images: ImageInfo[], json: boolean) {
  if (json) {
    console.log(JSON.stringify(images, null, 2));
    return;
  }
  for (const image of images) {
    console.log(`${image.name}\t${image.dir}\t${summarizeTargets(image)}\t${image.registries.join(',') || '-'}`);
  }
}

const program = new Command();

program
  .name('dockerfiles')
  .description('Inspect and maintain dockerfiles image metadata')
  .showHelpAfterError()
  .showSuggestionAfterError();

program
  .command('scan')
  .description('Scan docker-bake.hcl files')
  .option('--json', 'print JSON')
  .action((options: { json?: boolean }) => {
    printScan(scanImages(), Boolean(options.json));
  });

program
  .command('readme')
  .description('Update the generated README region from manifest and tracked Bake metadata')
  .option('--check', 'fail if the generated region is out of date; do not write')
  .action((options: { check?: boolean }) => {
    const images = scanImages();
    const out = path.join(root, 'README.md');
    const before = readText(out);
    const after = replaceReadmeRegion(before, generateReadme(images));
    if (options.check && before !== after) throw new Error('README generated region is out of date; run just readme');
    if (!options.check && before !== after) writeFileSync(out, after);
    console.log(`${options.check ? 'checked' : before === after ? 'unchanged' : 'updated'} ${rel(out)} generated region (${images.length} image groups)`);
  });

program
  .command('manifest:check')
  .description('Validate manifest versions, references and dependency graph')
  .option('--json', 'print resolved versions as JSON')
  .action((options: { json?: boolean }) => {
    const releases = loadReleases(root);
    console.log(options.json ? JSON.stringify(releases, null, 2)
      : `manifest valid: ${releases.length} variants; build order: ${releases.map((release) => release.id).join(' -> ')}`);
  });

program
  .command('status')
  .description('Inspect manifest build targets and optionally live GHCR tag existence')
  .argument('[image]', 'image or image.variant; omit to inspect all managed variants')
  .option('--remote', 'query GHCR; auth and network failures are reported separately from missing tags')
  .option('--json', 'print structured status')
  .action(async (selector: string | undefined, options: { remote?: boolean; json?: boolean }) => {
    const releases = loadReleases(root);
    const selected = selector ? [selectRelease(releases, selector)] : releases;
    const rows = await Promise.all(selected.map(async (release) => {
      let build: { state: 'ready' | 'error'; nativeCanonicalTag?: boolean; platforms?: string[]; detail?: string };
      try {
        const bake = inspectBake(root, release);
        const target = bake.target![release.build.target];
        build = { state: 'ready', nativeCanonicalTag: Boolean(target.tags?.includes(release.ref)), platforms: target.platforms };
        generatedBake(bake, release, releases);
      } catch (error) {
        build = { state: 'error', detail: error instanceof Error ? error.message.split('\n')[0] : String(error) };
      }
      const publication: Publication = options.remote ? await inspectPublication(release.ref) : { state: 'unchecked' };
      return { id: release.id, scheme: release.version.scheme, version: release.tag, ref: release.ref,
        alpine: release.alpine, dependencies: release.dependencies, build, publication };
    }));
    if (options.json) console.log(JSON.stringify(rows, null, 2));
    else {
      console.log('VARIANT\tTARGET VERSION\tBUILD\tBAKE TAG\tGHCR');
      for (const row of rows) {
        console.log(`${row.id}\t${row.version}\t${row.build.state}\t${row.build.state === 'error' ? 'unknown' : row.build.nativeCanonicalTag ? 'native' : 'generated'}\t${row.publication.state}${row.publication.digest ? ` ${row.publication.digest}` : ''}`);
        for (const detail of [row.build.detail, row.publication.detail].filter(Boolean)) console.log(`  ${detail}`);
      }
      console.log('BUILD ready = target/config validated, not a successful image build. GHCR published = tag exists, not source equivalence.');
    }
    if (rows.some((row) => row.build.state === 'error' || ['inaccessible', 'error'].includes(row.publication.state))) process.exitCode = 1;
  });

program
  .command('plan')
  .description('Preview dependency-ordered affected builds; does not change revisions or build images')
  .argument('[images...]', 'changed image or variant IDs; omit for the whole manifest')
  .option('--json', 'print structured build plan')
  .action((selectors: string[], options: { json?: boolean }) => {
    const releases = planReleases(loadReleases(root), selectors);
    const plan = releases.map((release) => ({ id: release.id, dir: release.build.dir, target: release.build.target,
      version: release.tag, ref: release.ref, needs: release.dependencies }));
    if (options.json) console.log(JSON.stringify(plan, null, 2));
    else for (const [index, item] of plan.entries()) console.log(`${index + 1}. ${item.id}\t${item.ref}\tneeds=${item.needs.join(',') || '-'}`);
  });

program
  .command('graph')
  .description('Print the manifest dependency graph as Mermaid')
  .action(() => console.log(graph(loadReleases(root))));

function sourceRevision() {
  const revision = process.env.GITHUB_SHA ?? execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
  return /^[a-f0-9]{40}$/.test(revision) ? revision : undefined;
}

program
  .command('publish')
  .description('Build and push missing GHCR canonical tags in dependency order; dry-run unless --push is set')
  .argument('[images...]', 'image or variant IDs; omit for the whole manifest')
  .option('--push', 'build and push missing tags (intended for GitHub Actions)')
  .option('--platforms <list>', 'comma-separated platform override, e.g. linux/amd64')
  .action(async (selectors: string[], options: { push?: boolean; platforms?: string }) => {
    for (const selector of selectors) {
      if (!/^[a-z0-9][a-z0-9._-]*$/.test(selector)) throw new Error(`invalid image selector ${JSON.stringify(selector)}`);
    }
    const releases = loadReleases(root);
    const platforms = parsePlatforms(options.platforms);
    const revision = sourceRevision();
    const results: { id: string; ref: string; action: string; digest?: string }[] = [];
    let current: string | undefined;
    try {
      for (const release of planReleases(releases, selectors)) {
        current = release.id;
        const action = publishAction(await inspectPublication(release.ref));
        if (action === 'skip') {
          results.push({ id: release.id, ref: release.ref, action: 'skip (published)' });
          continue;
        }
        const bake = generatedBake(inspectBake(root, release), release, releases, { platforms, revision });
        if (!options.push) {
          results.push({ id: release.id, ref: release.ref, action: 'would build' });
          continue;
        }
        console.error(`==> ${release.id}: building ${release.ref}`);
        prepareBuild(root, release);
        pushBake(root, release, bake);
        const published = await inspectPublication(release.ref);
        if (published.state !== 'published') throw new Error(`pushed but registry reports ${published.state}`);
        results.push({ id: release.id, ref: release.ref, action: 'built', digest: published.digest });
      }
      current = undefined;
    } catch (error) {
      if (current) results.push({ id: current, ref: '-', action: 'failed' });
      throw new Error(`${current ?? 'publish'}: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      console.log('ACTION\tVARIANT\tREF');
      for (const item of results) console.log(`${item.action}\t${item.id}\t${item.ref}${item.digest ? ` ${item.digest}` : ''}`);
      if (process.env.GITHUB_STEP_SUMMARY) {
        const rows = results.map((item) => `| \`${item.id}\` | ${item.action} | \`${item.ref}\` | ${item.digest ? `\`${item.digest}\`` : '-'} |`);
        writeFileSync(process.env.GITHUB_STEP_SUMMARY, [
          `### GHCR publish${options.push ? '' : ' (dry-run)'}`, '',
          '| Variant | Action | Ref | Digest |', '|---|---|---|---|', ...rows, '',
        ].join('\n'), { flag: 'a' });
      }
    }
  });

program
  .command('manifest:bake')
  .description('Print a GHCR-only Bake JSON preview; no build, file write or publication')
  .argument('<image>', 'image or image.variant')
  .action((selector: string) => {
    const releases = loadReleases(root);
    const release = selectRelease(releases, selector);
    console.log(JSON.stringify(generatedBake(inspectBake(root, release), release, releases), null, 2));
  });

program
  .command('rev:bump')
  .description('Preview or write an image revision bump')
  .argument('<image>', 'image name or directory, e.g. postgres or base/base')
  .option('--write', 'write the bump to docker-bake.hcl')
  .option('--rev-var <name>', 'revision variable name, e.g. REV or PG_REVISION')
  .action((imageRef: string, options: { write?: boolean; revVar?: string }) => {
    const info = findImage(scanImages(), imageRef);
    if (!info) throw new Error(`unknown image: ${imageRef}`);
    console.log(JSON.stringify({ image: info.name, dir: info.dir, ...bumpRevision(info, { variable: options.revVar, write: Boolean(options.write) }) }, null, 2));
  });

program
  .command('base:check')
  .description('Check tracked upstream base image digests and optionally bump revision on changes')
  .argument('<image>', 'image name or directory, e.g. postgres or base/base')
  .option('--write', 'write digest state and revision bump')
  .option('--bump', 'bump revision when an existing tracked base digest changed')
  .option('--state <path>', 'digest state path', '.github/image-base-digests.json')
  .option('--rev-var <name>', 'revision variable name, e.g. REV or PG_REVISION')
  .action((imageRef: string, options: { write?: boolean; bump?: boolean; state?: string; revVar?: string }) => {
    checkBaseDigests(scanImages(), imageRef, options);
  });

program
  .command('ghcr:prepare')
  .description('Generate a GHCR-only bake override and check the canonical revision tag')
  .argument('<image>', 'image name or directory, e.g. postgres or base/base')
  .option('--target <name>', 'bake target name')
  .option('--repository <repo>', 'GHCR repository, e.g. ghcr.io/wenerme/dockerfiles/postgres')
  .option('--output <path>', 'generated bake override path', 'docker-bake.ghcr.generated.hcl')
  .option('--force', 'build even when the canonical tag already exists')
  .option('--github-output <path>', 'append GitHub Actions step outputs to this file')
  .action((imageRef: string, options: { target?: string; repository?: string; output?: string; force?: boolean; githubOutput?: string }) => {
    console.log(JSON.stringify(prepareGhcrBake(scanImages(), imageRef, options), null, 2));
  });

try {
  await program.parseAsync(process.argv);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
