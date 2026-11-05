import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { Command } from 'commander';
import {
  aliasRefs, anonymousPublication, digestFileName, generatedBake, graph, hostPlatform, inspectBake, inspectPublication, loadReleases, localRef,
  mergeDigests, parseLocalRegistry, parsePlatforms, planReleases, prepareBuild, publishAction, pushBake, testRelease,
  selectRelease, syncTags, validateSelectors, type Publication, type TagSync,
} from '../lib/manifest.ts';
import { commandError, root, sourceRevision } from '../lib/repo.ts';

type ResultRow = { id: string; ref: string; action: string; digest?: string };

const tagRows = (id: string, syncs: TagSync[], prefix = ''): ResultRow[] =>
  syncs.map((sync) => ({ id, ref: sync.ref, action: `${prefix}${sync.action}`, digest: sync.digest }));

function printRows(results: ResultRow[]) {
  console.log('ACTION\tVARIANT\tREF');
  for (const item of results) console.log(`${item.action}\t${item.id}\t${item.ref}${item.digest ? ` ${item.digest}` : ''}`);
}

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
    .option('--native', 'handle build.native variants only, on a runner of the selected platform; other runs skip them')
    .option('--digest-dir <dir>', 'with --native --push: push one platform by digest, test it and record the digest here')
    .option('--merge <dir>', 'with --native --push: merge the recorded platform digests into canonical tags and move aliases')
    .action(async (selectors: string[], options: {
      push?: boolean; platforms?: string; verifyRegistry?: string; native?: boolean; digestDir?: string; merge?: string;
    }) => {
      if (options.push && options.verifyRegistry) throw new Error('--push and --verify-registry are mutually exclusive');
      if ((options.digestDir || options.merge) && !(options.native && options.push)) throw new Error('--digest-dir and --merge need --native --push');
      if (options.digestDir && options.merge) throw new Error('--digest-dir and --merge are mutually exclusive');
      validateSelectors(selectors);
      const verify = options.verifyRegistry ? parseLocalRegistry(options.verifyRegistry) : undefined;
      // Parents built in this verification run are consumed from the local registry, not GHCR.
      const localRefs = new Map<string, string>();
      const releases = loadReleases(root);
      const platforms = parsePlatforms(options.platforms) ?? [];
      // A native build runs on its own architecture: one platform, and never emulated.
      const nativeBuild = Boolean(options.native && !options.merge && (verify || options.push));
      if (nativeBuild) {
        if (platforms.length !== 1) throw new Error('native builds need exactly one --platforms entry');
        const host = await hostPlatform();
        if (host !== platforms[0]) throw new Error(`native ${platforms[0]} build on a ${host} Docker host`);
      }
      const revision = await sourceRevision();
      const results: ResultRow[] = [];
      let current: string | undefined;
      try {
        for (const release of planReleases(releases, selectors)) {
          if (Boolean(release.build.native) !== Boolean(options.native)) {
            if (release.build.native) results.push({ id: release.id, ref: release.ref, action: 'skip (native job)' });
            continue;
          }
          current = release.id;
          const inspected = await inspectPublication(release.ref);
          const publication = verify ? anonymousPublication(inspected) : inspected;
          if (publishAction(publication) === 'skip') {
            results.push({ id: release.id, ref: release.ref, action: 'skip (published)' });
            // Platform jobs leave aliases to the merge job so parallel runners never race on them.
            if (options.digestDir) continue;
            // Moving tags follow the published canonical tag; only a real publish writes to GHCR.
            results.push(...tagRows(release.id,
              await syncTags(release.repository, publication.digest!, aliasRefs(release), Boolean(options.push)), 'alias '));
            continue;
          }
          const source = await inspectBake(root, release);
          if (release.build.native && nativeBuild && !(source.target![release.build.target].platforms ?? []).includes(platforms[0])) {
            results.push({ id: release.id, ref: release.ref, action: `skip (not built for ${platforms[0]})` });
            continue;
          }
          if (options.merge) {
            const wanted = platforms.length ? platforms : source.target![release.build.target].platforms ?? [];
            if (!wanted.length) throw new Error('no platforms to merge');
            const digests = wanted.map((platform) => {
              const file = path.join(options.merge!, digestFileName(release, platform));
              if (!existsSync(file)) throw new Error(`no ${platform} digest recorded (${file})`);
              return readFileSync(file, 'utf8').trim();
            });
            console.error(`==> ${release.id}: merging ${wanted.join(', ')} into ${release.ref}`);
            const digest = await mergeDigests(release, digests);
            results.push({ id: release.id, ref: release.ref, action: 'merged', digest });
            results.push(...tagRows(release.id, await syncTags(release.repository, digest, aliasRefs(release), true), 'alias '));
            continue;
          }
          const target = verify ? localRef(release.ref, verify) : release.ref;
          const bake = generatedBake(source, release, releases, {
            platforms: platforms.length ? platforms : undefined, revision, ref: target, dependencyRefs: localRefs, byDigest: Boolean(options.digestDir),
          });
          if (!options.push && !verify) {
            results.push({ id: release.id, ref: release.ref, action: 'would build' });
            results.push(...aliasRefs(release).map((ref) => ({ id: release.id, ref, action: 'alias would update' })));
            continue;
          }
          console.error(`==> ${release.id}: building ${target}${platforms.length ? ` (${platforms.join(', ')})` : ''}`);
          await prepareBuild(root, release);
          const pushed = await pushBake(root, release, bake);
          if (options.digestDir) {
            const ref = `${release.repository}@${pushed}`;
            await testRelease(root, release, ref);
            mkdirSync(options.digestDir, { recursive: true });
            writeFileSync(path.join(options.digestDir, digestFileName(release, platforms[0])), `${pushed}\n`);
            results.push({ id: release.id, ref, action: `built ${platforms[0]} (merge pending)`, digest: pushed });
            continue;
          }
          const published = await inspectPublication(target);
          if (published.state !== 'published') throw new Error(`pushed but ${target} reports ${published.state}`);
          if (release.build.native) await testRelease(root, release, target);
          if (verify) localRefs.set(release.id, target);
          results.push({ id: release.id, ref: target, action: verify ? 'verified' : 'built', digest: published.digest });
          const repository = verify ? localRef(release.repository, verify) : release.repository;
          results.push(...tagRows(release.id, await syncTags(repository, published.digest!, aliasRefs(release, verify), true), 'alias '));
        }
        current = undefined;
      } catch (error) {
        if (current) results.push({ id: current, ref: '-', action: 'failed' });
        throw new Error(`${current ?? 'publish'}: ${commandError(error)}`);
      } finally {
        printRows(results);
        if (process.env.GITHUB_STEP_SUMMARY) {
          const rows = results.map((item) => `| \`${item.id}\` | ${item.action} | \`${item.ref}\` | ${item.digest ? `\`${item.digest}\`` : '-'} |`);
          writeFileSync(process.env.GITHUB_STEP_SUMMARY, [
            `### GHCR publish${options.native ? ` (native${platforms.length ? ` ${platforms.join(', ')}` : ''})` : ''}${options.push ? '' : verify ? ` (verify build, pushed to ${verify} only)` : ' (dry-run)'}`, '',
            '| Variant | Action | Ref | Digest |', '|---|---|---|---|', ...rows, '',
          ].join('\n'), { flag: 'a' });
        }
      }
    });

}
