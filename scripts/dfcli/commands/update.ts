import type { Command } from 'commander';
import { fetchAlpineBranches, planUpdate, type AlpineBranches } from '../lib/alpine.ts';
import { scanImages } from '../lib/bake-scan.ts';
import { resolveManifest } from '../lib/manifest.ts';
import { applyManifestPlan, readManifest } from '../lib/manifest-write.ts';
import { UpstreamResolver, type UpstreamResult } from '../lib/upstream.ts';

/** Fallback when the base Bake file does not declare a mirror. */
const defaultAlpineMirror = 'https://dl-cdn.alpinelinux.org/alpine';

/** Upstream scan for manifest-managed variants: Alpine patches and tracked application versions. */
export function registerUpdateCommands(program: Command) {
  program
    .command('update')
    .description('Check Alpine patches and tracked upstream versions, then update versions and revisions; preview unless --write')
    .option('--write', 'write manifest.yaml, images.txt and the README regions')
    .option('--json', 'print the planned changes as JSON')
    .action(async (options: { write?: boolean; json?: boolean }) => {
      const { source, manifest } = readManifest();
      // Track Alpine packages on the mirror the images install from, so a version is installable when it is picked.
      const base = (await scanImages()).find((image) => image.dir === 'base/base');
      const resolver = new UpstreamResolver({ alpineMirror: base?.variables.ALPINE_MIRROR || defaultAlpineMirror });
      const tracked = resolveManifest(manifest).filter((release) => release.track);
      let alpineError: string | undefined;
      const [branches, results] = await Promise.all([
        fetchAlpineBranches().catch((error: unknown): AlpineBranches => {
          alpineError = error instanceof Error ? error.message : String(error);
          return new Map();
        }),
        Promise.all(tracked.map(async (release) => [release.id, await resolver.latest(release.track!, release)] as const)),
      ]);
      const latest = new Map<string, UpstreamResult>(results);
      const plan = planUpdate(manifest, branches, latest);
      if (alpineError) plan.notes.unshift(`Alpine release lookup failed; Alpine patches not checked: ${alpineError}`);
      await applyManifestPlan(plan, source, options);
      // A failed lookup must not look like "everything is current" to a scheduled job.
      if (alpineError || results.some(([, result]) => result.error)) process.exitCode = 1;
    });
}
