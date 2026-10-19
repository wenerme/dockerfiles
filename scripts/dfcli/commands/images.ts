import { writeFileSync } from 'node:fs';
import type { Command } from 'commander';
import {
  generatedBake, graph, inspectBake, inspectPublication, loadReleases, localRef, parseLocalRegistry, parsePlatforms,
  planReleases, prepareBuild, publishAction, pushBake, selectRelease, validateSelectors, type Publication,
} from '../lib/manifest.ts';
import { commandError, root, sourceRevision } from '../lib/repo.ts';

/** Manifest-managed images: status, plan, graph and GHCR publishing. */
export function registerImageCommands(program: Command) {
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
          const bake = await inspectBake(root, release);
          const target = bake.target![release.build.target];
          build = { state: 'ready', nativeCanonicalTag: Boolean(target.tags?.includes(release.ref)), platforms: target.platforms };
          generatedBake(bake, release, releases);
        } catch (error) {
          build = { state: 'error', detail: commandError(error).split('\n')[0] };
        }
        const publication: Publication = options.remote ? await inspectPublication(release.ref) : { state: 'unchecked' };
        return {
          id: release.id, scheme: release.version.scheme, version: release.tag, ref: release.ref,
          alpine: release.alpine, dependencies: release.dependencies, build, publication,
        };
      }));
      if (options.json) {
        console.log(JSON.stringify(rows, null, 2));
      } else {
        console.log('VARIANT\tTARGET VERSION\tBUILD\tBAKE TAG\tGHCR');
        for (const row of rows) {
          const bakeTag = row.build.state === 'error' ? 'unknown' : row.build.nativeCanonicalTag ? 'native' : 'generated';
          const ghcr = `${row.publication.state}${row.publication.digest ? ` ${row.publication.digest}` : ''}`;
          console.log(`${row.id}\t${row.version}\t${row.build.state}\t${bakeTag}\t${ghcr}`);
          for (const detail of [row.build.detail, row.publication.detail].filter(Boolean)) console.log(`  ${detail}`);
        }
        console.log('BUILD ready = target/config validated, not a successful image build. GHCR published = tag exists, not source equivalence.');
      }
      if (rows.some((row) => row.build.state === 'error' || ['inaccessible', 'error'].includes(row.publication.state))) {
        process.exitCode = 1;
      }
    });

  program
    .command('plan')
    .description('Preview dependency-ordered affected builds; does not change revisions or build images')
    .argument('[images...]', 'changed image or variant IDs; omit for the whole manifest')
    .option('--json', 'print structured build plan')
    .action((selectors: string[], options: { json?: boolean }) => {
      const plan = planReleases(loadReleases(root), selectors).map((release) => ({
        id: release.id, dir: release.build.dir, target: release.build.target,
        version: release.tag, ref: release.ref, needs: release.dependencies,
      }));
      if (options.json) console.log(JSON.stringify(plan, null, 2));
      else for (const [index, item] of plan.entries()) console.log(`${index + 1}. ${item.id}\t${item.ref}\tneeds=${item.needs.join(',') || '-'}`);
    });

  program
    .command('graph')
    .description('Print the manifest dependency graph as Mermaid')
    .action(() => console.log(graph(loadReleases(root))));

  program
    .command('publish')
    .description('Build and push missing GHCR canonical tags in dependency order; dry-run unless --push is set')
    .argument('[images...]', 'image or variant IDs; omit for the whole manifest')
    .option('--push', 'build and push missing tags (intended for GitHub Actions)')
    .option('--platforms <list>', 'comma-separated platform override, e.g. linux/amd64')
    .option('--verify-registry <host:port>', 'build missing tags and push them to a local registry instead of GHCR (pull request checks)')
    .action(async (selectors: string[], options: { push?: boolean; platforms?: string; verifyRegistry?: string }) => {
      if (options.push && options.verifyRegistry) throw new Error('--push and --verify-registry are mutually exclusive');
      validateSelectors(selectors);
      const verify = options.verifyRegistry ? parseLocalRegistry(options.verifyRegistry) : undefined;
      // Parents built in this verification run are consumed from the local registry, not GHCR.
      const localRefs = new Map<string, string>();
      const releases = loadReleases(root);
      const platforms = parsePlatforms(options.platforms);
      const revision = await sourceRevision();
      const results: { id: string; ref: string; action: string; digest?: string }[] = [];
      let current: string | undefined;
      try {
        for (const release of planReleases(releases, selectors)) {
          current = release.id;
          if (publishAction(await inspectPublication(release.ref)) === 'skip') {
            results.push({ id: release.id, ref: release.ref, action: 'skip (published)' });
            continue;
          }
          const target = verify ? localRef(release.ref, verify) : release.ref;
          const bake = generatedBake(await inspectBake(root, release), release, releases, {
            platforms, revision, ref: target, dependencyRefs: localRefs,
          });
          if (!options.push && !verify) {
            results.push({ id: release.id, ref: release.ref, action: 'would build' });
            continue;
          }
          console.error(`==> ${release.id}: building ${target}`);
          await prepareBuild(root, release);
          await pushBake(root, release, bake);
          const published = await inspectPublication(target);
          if (published.state !== 'published') throw new Error(`pushed but ${target} reports ${published.state}`);
          if (verify) localRefs.set(release.id, target);
          results.push({ id: release.id, ref: target, action: verify ? 'verified' : 'built', digest: published.digest });
        }
        current = undefined;
      } catch (error) {
        if (current) results.push({ id: current, ref: '-', action: 'failed' });
        throw new Error(`${current ?? 'publish'}: ${commandError(error)}`);
      } finally {
        console.log('ACTION\tVARIANT\tREF');
        for (const item of results) console.log(`${item.action}\t${item.id}\t${item.ref}${item.digest ? ` ${item.digest}` : ''}`);
        if (process.env.GITHUB_STEP_SUMMARY) {
          const rows = results.map((item) => `| \`${item.id}\` | ${item.action} | \`${item.ref}\` | ${item.digest ? `\`${item.digest}\`` : '-'} |`);
          writeFileSync(process.env.GITHUB_STEP_SUMMARY, [
            `### GHCR publish${options.push ? '' : verify ? ` (verify build, pushed to ${verify} only)` : ' (dry-run)'}`, '',
            '| Variant | Action | Ref | Digest |', '|---|---|---|---|', ...rows, '',
          ].join('\n'), { flag: 'a' });
        }
      }
    });
}
