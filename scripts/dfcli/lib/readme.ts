import { resolveFromImage, type ImageInfo } from './bake-scan.ts';
import { renderManifestTable, type Release } from './manifest.ts';

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

export function generateReadme(images: ImageInfo[], releases: Release[]) {
  const managedDirs = new Set(releases.map((release) => release.build.dir));
  const remaining = images.filter((image) => !managedDirs.has(image.dir));
  const nameCount = new Map<string, number>();
  for (const image of images) nameCount.set(image.name, (nameCount.get(image.name) ?? 0) + 1);
  const rows = remaining.map((image) => {
    // Two groups share a name (base/base and base/): there the parent really is the other group, so keep it.
    const own = nameCount.get(image.name) === 1 ? `wener/${image.name}` : undefined;
    return `| [${image.name}](${image.dir}/) | ${summarizeVariants(image)} | ${summarizeBase(image, own)} |`;
  });

  return `${renderManifestTable(releases)}

### 尚未迁移的 Bake 镜像清单

已跟踪的 Bake 配置共 ${images.length} 组，manifest 管理 ${releases.length} 个 variant；其余 ${remaining.length} 组列在下面。Variants 是默认镜像之外的 Bake target，Base 只列出父镜像仓库。

| Image | Variants | Base |
|---|---|---|
${rows.join('\n')}
`;
}
