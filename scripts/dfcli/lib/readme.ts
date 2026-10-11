import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { resolveFromImage, type ImageInfo } from './bake-scan.ts';
import { replaceReadmeRegion, type Release } from './manifest.ts';

type ReadmeLocale = 'en' | 'zh-CN';

const copy = {
  en: {
    manifestHeading: 'Manifest Release Targets',
    manifestDescription: 'Desired versions from `manifest.yaml`. Publication status is available through `just status --remote`.',
    manifestColumns: '| Variant | Build | Version scheme | Target version | Alpine | Base | GHCR canonical ref |',
    bakeHeading: 'Additional Bake Image Groups',
    bakeDescription: (groups: number, variants: number, remaining: number) =>
      `${groups} tracked Bake groups and ${variants} manifest variants. The ${remaining} groups below are not managed by the manifest. Variants lists nondefault Bake targets; Base lists parent image repositories.`,
    bakeColumns: '| Image | Variants | Base |',
  },
  'zh-CN': {
    manifestHeading: 'Manifest 发布目标',
    manifestDescription: '`manifest.yaml` 中定义的目标版本。发布状态可通过 `just status --remote` 查询。',
    manifestColumns: '| 变体 | 构建 | 版本策略 | 目标版本 | Alpine | 基础镜像 | GHCR canonical 引用 |',
    bakeHeading: '其他 Bake 镜像组',
    bakeDescription: (groups: number, variants: number, remaining: number) =>
      `共 ${groups} 个已跟踪的 Bake 镜像组，manifest 管理 ${variants} 个变体。下列 ${remaining} 个镜像组尚未纳入 manifest。变体列出非默认的 Bake target，基础镜像仅列出父镜像仓库。`,
    bakeColumns: '| 镜像 | 变体 | 基础镜像 |',
  },
} satisfies Record<ReadmeLocale, {
  manifestHeading: string;
  manifestDescription: string;
  manifestColumns: string;
  bakeHeading: string;
  bakeDescription: (groups: number, variants: number, remaining: number) => string;
  bakeColumns: string;
}>;

// Variants are published Bake targets other than the default image (named like the image or tagged "latest");
// abstract parents (no tags, only inherited) are skipped.
export function summarizeVariants(info: ImageInfo) {
  const inherited = new Set(info.targets.flatMap((target) => target.inherits));
  const names = info.defaultTargets.length ? info.defaultTargets : info.targets.map((target) => target.name);
  const variants = names.filter((name) => {
    if (name === 'default' || name === info.name) return false;
    const target = info.targets.find((item) => item.name === name);
    if (target?.isLatest) return false;
    return !(target && !target.hasTags && inherited.has(name));
  });
  return variants.length ? variants.join(', ') : '-';
}

/** Only the repository part: wener/app:3.24.1-ssh -> wener/app, localhost:5000/x:1 -> localhost:5000/x. */
export function imageRepository(image: string) {
  const withoutDigest = image.split('@')[0];
  const colon = withoutDigest.lastIndexOf(':');
  return colon > withoutDigest.lastIndexOf('/') ? withoutDigest.slice(0, colon) : withoutDigest;
}

// Parent repositories only; a variant built from the same image (wener/app -> wener/app:ssh) is not a base.
export function summarizeBase(info: ImageInfo, ownRepository?: string) {
  const bases = [...new Set(info.fromImages
    .map((item) => resolveFromImage(item, info.variables))
    .filter((item) => item !== 'scratch')
    .map(imageRepository))]
    .filter((item) => item !== ownRepository)
    .sort();
  return bases.length ? bases.map((item) => `\`${item}\``).join('<br>') : '-';
}

function renderManifestTable(releases: Release[], locale: ReadmeLocale): string {
  const text = copy[locale];
  const rows = releases.map((release) => {
    const base = release.base?.image ? `${release.base.image}.${release.base.variant ?? 'default'}`
      : release.base?.ref ?? 'scratch / Alpine minirootfs';
    return `| \`${release.id}\` | [${release.build.dir}](${release.build.dir}/) · \`${release.build.target}\` | ${release.version.scheme} | \`${release.tag}\` | ${release.alpine ?? '—'} | \`${base}\` | \`${release.ref}\` |`;
  });
  return [
    `### ${text.manifestHeading}`, '', text.manifestDescription, '', text.manifestColumns,
    '|---|---|---|---|---|---|---|', ...rows,
  ].join('\n');
}

export function generateReadme(images: ImageInfo[], releases: Release[], locale: ReadmeLocale = 'en') {
  const text = copy[locale];
  const managedDirs = new Set(releases.map((release) => release.build.dir));
  const remaining = images.filter((image) => !managedDirs.has(image.dir));
  const nameCount = new Map<string, number>();
  for (const image of images) nameCount.set(image.name, (nameCount.get(image.name) ?? 0) + 1);
  const rows = remaining.map((image) => {
    // Two groups share a name (base/base and base/): there the parent really is the other group, so keep it.
    const own = nameCount.get(image.name) === 1 ? `wener/${image.name}` : undefined;
    return `| [${image.name}](${image.dir}/) | ${summarizeVariants(image)} | ${summarizeBase(image, own)} |`;
  });

  return `${renderManifestTable(releases, locale)}

### ${text.bakeHeading}

${text.bakeDescription(images.length, releases.length, remaining.length)}

${text.bakeColumns}
|---|---|---|
${rows.join('\n')}
`;
}

/** Prepare both documents before writing; check mode leaves their contents untouched. */
export function syncReadmes(root: string, images: ImageInfo[], releases: Release[], options: { check?: boolean } = {}) {
  const documents: { file: string; locale: ReadmeLocale }[] = [
    { file: 'README.md', locale: 'en' },
    { file: 'README.zh-CN.md', locale: 'zh-CN' },
  ];
  const updates = documents.map(({ file, locale }) => {
    const out = path.join(root, file);
    const before = readFileSync(out, 'utf8');
    const after = replaceReadmeRegion(before, generateReadme(images, releases, locale));
    return { file, out, after, changed: before !== after };
  });
  const stale = updates.filter((update) => update.changed);
  if (options.check && stale.length) {
    throw new Error(`${stale.map((update) => update.file).join(', ')} generated region is out of date; run just readme`);
  }
  return updates.map(({ file, out, after, changed }) => {
    if (!options.check && changed) writeFileSync(out, after);
    return { file, state: options.check ? 'checked' : changed ? 'updated' : 'unchanged' };
  });
}
