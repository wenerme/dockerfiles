import type { Release, Track } from './manifest.ts';

/**
 * Loose version order for upstream versions: numeric segments compared in order, so
 * 1.30.4-r1 < 1.30.4-r3 < 1.31.0 and 24.9.0 < 24.22.1. Non-numeric separators are ignored.
 */
export function compareLoose(a: string, b: string): number {
  const parts = (value: string) => value.split(/[^0-9]+/).filter(Boolean).map(Number);
  const [x, y] = [parts(a), parts(b)];
  for (let index = 0; index < Math.max(x.length, y.length); index += 1) {
    const diff = (x[index] ?? -1) - (y[index] ?? -1);
    if (diff) return diff;
  }
  return 0;
}

/** Package name -> version from an APKINDEX text. */
export function parseApkIndex(index: string): Map<string, string> {
  const versions = new Map<string, string>();
  let name: string | undefined;
  for (const line of index.split('\n')) {
    if (line.startsWith('P:')) name = line.slice(2);
    else if (line.startsWith('V:') && name) versions.set(name, line.slice(2));
    else if (!line) name = undefined;
  }
  return versions;
}

/** A GitHub release tag as a version: v0.71.1 and bun-v1.4.3 both become plain numbers; prereleases are rejected. */
export function releaseVersion(tag: string): string | undefined {
  const version = tag.replace(/^[^0-9]*/, '');
  return /^\d+(?:\.\d+)+$/.test(version) ? version : undefined;
}

/** Newest release of a Node.js major line that has musl builds for both target architectures. */
export function nodejsMuslVersion(index: unknown, major: string): string | undefined {
  if (!Array.isArray(index)) throw new Error('Node.js release index: expected a list');
  const releases = (index as { version?: unknown; files?: unknown }[])
    .filter((entry) => typeof entry.version === 'string' && entry.version.startsWith(`v${major}.`)
      && Array.isArray(entry.files) && ['linux-x64-musl', 'linux-arm64-musl'].every((file) => (entry.files as unknown[]).includes(file)))
    .map((entry) => (entry.version as string).slice(1));
  return releases.sort(compareLoose).at(-1);
}

/** Docker Hub tag listing entry (hub.docker.com v2 API). */
export interface HubTag { name: string; images?: { architecture?: string; os?: string }[] }

/** Newest `<prefix>...<suffix>` tag with linux amd64 and arm64 images; the version is the tag without the suffix. */
export function dockerHubVersion(tags: HubTag[], prefix = '', suffix = ''): string | undefined {
  const versions = tags.filter((tag) => {
    if (!tag.name.startsWith(prefix) || !tag.name.endsWith(suffix)) return false;
    if (!/^\d+(?:\.\d+)*$/.test(tag.name.slice(0, tag.name.length - suffix.length))) return false;
    const architectures = new Set((tag.images ?? []).filter((image) => (image.os ?? 'linux') === 'linux').map((image) => image.architecture));
    return architectures.has('amd64') && architectures.has('arm64');
  }).map((tag) => tag.name.slice(0, tag.name.length - suffix.length));
  return versions.sort(compareLoose).at(-1);
}

export interface UpstreamResult { version?: string; error?: string }

export interface UpstreamOptions {
  /** Alpine mirror used by the images, so a tracked package is installable when the build runs. */
  alpineMirror: string;
  fetch?: typeof fetch;
}

const architectures = ['x86_64', 'aarch64'];

/** Looks up tracked versions with per-run caching; failures are returned per variant, never thrown. */
export class UpstreamResolver {
  private readonly cache = new Map<string, Promise<unknown>>();
  private readonly fetcher: typeof fetch;

  constructor(private readonly options: UpstreamOptions) {
    this.fetcher = options.fetch ?? fetch;
  }

  private cached<T>(key: string, load: () => Promise<T>): Promise<T> {
    if (!this.cache.has(key)) this.cache.set(key, load());
    return this.cache.get(key) as Promise<T>;
  }

  private async get(url: string, headers: Record<string, string> = {}): Promise<Response> {
    const response = await this.fetcher(url, { headers, signal: AbortSignal.timeout(60_000) });
    if (!response.ok) throw new Error(`HTTP ${response.status} from ${url}`);
    return response;
  }

  private apkIndex(branch: string, repo: string, arch: string): Promise<Map<string, string>> {
    return this.cached(`apk:${branch}:${repo}:${arch}`, async () => {
      const url = `${this.options.alpineMirror.replace(/\/$/, '')}/v${branch}/${repo}/${arch}/APKINDEX.tar.gz`;
      const archive = new Bun.Archive(await (await this.get(url)).bytes());
      const file = (await archive.files()).get('APKINDEX');
      if (!file) throw new Error(`APKINDEX missing in ${url}`);
      return parseApkIndex(await file.text());
    });
  }

  async apk(branch: string, name: string, pkgrel = true): Promise<string> {
    const found = await Promise.all(architectures.map(async (arch) => {
      for (const repo of ['main', 'community']) {
        const version = (await this.apkIndex(branch, repo, arch)).get(name);
        if (version) return version;
      }
      return undefined;
    }));
    if (found.some((version) => !version)) throw new Error(`apk ${name} not found in Alpine ${branch} for ${architectures.join(' and ')}`);
    if (found[0] !== found[1]) throw new Error(`apk ${name} differs between architectures: ${found.join(' vs ')}`);
    return pkgrel ? found[0]! : found[0]!.replace(/-r\d+$/, '');
  }

  github(repo: string): Promise<string> {
    return this.cached(`github:${repo}`, async () => {
      const token = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
      const release = await (await this.get(`https://api.github.com/repos/${repo}/releases/latest`, {
        Accept: 'application/vnd.github+json', ...(token ? { Authorization: `Bearer ${token}` } : {}),
      })).json() as { tag_name?: string };
      const version = release.tag_name ? releaseVersion(release.tag_name) : undefined;
      if (!version) throw new Error(`github ${repo}: unexpected latest release tag ${JSON.stringify(release.tag_name)}`);
      return version;
    });
  }

  nodejs(major: string): Promise<string> {
    return this.cached(`nodejs:${major}`, async () => {
      const index = await (await this.get('https://unofficial-builds.nodejs.org/download/release/index.json')).json();
      const version = nodejsMuslVersion(index, major);
      if (!version) throw new Error(`nodejs ${major}: no release with linux x64 and arm64 musl builds`);
      return version;
    });
  }

  docker(image: string, prefix = '', suffix = ''): Promise<string> {
    return this.cached(`docker:${image}:${prefix}:${suffix}`, async () => {
      const repository = image.includes('/') ? image : `library/${image}`;
      // The name filter is a substring match; it keeps the listing small, exact matching happens in dockerHubVersion.
      let url: string | null = `https://hub.docker.com/v2/repositories/${repository}/tags?page_size=100&name=${encodeURIComponent(prefix || suffix)}`;
      const tags: HubTag[] = [];
      // Read every page: the newest matching tag can be anywhere in the listing. The cap only guards against a loop.
      for (let page = 0; url; page += 1) {
        if (page >= 200) throw new Error(`docker ${image}: more than 200 pages of tags for ${prefix || suffix}; narrow the prefix`);
        const body = await (await this.get(url)).json() as { results?: HubTag[]; next?: string | null };
        tags.push(...(body.results ?? []));
        url = body.next ?? null;
      }
      const version = dockerHubVersion(tags, prefix, suffix);
      if (!version) throw new Error(`docker ${image}: no ${prefix}*${suffix} tag with linux amd64 and arm64 images`);
      return version;
    });
  }

  async latest(track: Track, release: Release): Promise<UpstreamResult> {
    try {
      if (track.apk) {
        if (!release.alpine) throw new Error('apk tracking needs an Alpine version');
        return { version: await this.apk(release.alpine.split('.').slice(0, 2).join('.'), track.apk, track.pkgrel ?? true) };
      }
      if (track.github) return { version: await this.github(track.github) };
      if (track.nodejs) return { version: await this.nodejs(track.nodejs) };
      if (track.docker) return { version: await this.docker(track.docker, track.prefix, track.suffix) };
      throw new Error('no track source');
    } catch (error) {
      return { error: error instanceof Error ? error.message : String(error) };
    }
  }
}
