import type { Command } from 'commander';
import { readImageList, syncImageList } from '../lib/images-list.ts';
import { loadReleases, parseNamespace, validateSelectors } from '../lib/manifest.ts';
import { regctlCopy, regctlDigest, regctlRepository, type RepositoryState } from '../lib/regctl.ts';
import { root, useRepositoryDockerConfig } from '../lib/repo.ts';

const source = 'ghcr.io/wenerme/dockerfiles';
const defaultTargets = ['docker.io/wener', 'quay.io/wener'];

type Row = { action: string; ref: string; detail?: string };

/** images.txt and the GHCR -> Docker Hub/Quay sync built on it. */
export function registerSyncCommands(program: Command) {
  program
    .command('images')
    .description('Write images.txt (one <image>:<tag> per line) from manifest.yaml')
    .option('--check', 'fail if images.txt is out of date; do not write')
    .action((options: { check?: boolean }) => {
      const result = syncImageList(root, loadReleases(root), options);
      console.log(`${result.state} ${result.file} (${result.lines} tags)`);
    });

  program
    .command('sync')
    .description('Copy the tags in images.txt from GHCR to Docker Hub and Quay with regctl; existing canonical tags are never overwritten; preview unless --push')
    .argument('[images...]', 'image names or exact <image>:<tag> lines; omit for every line')
    // Repeatable single-value option: a variadic one would swallow the image arguments that follow it.
    .option('--to <namespace>', `target namespace, repeatable (default: ${defaultTargets.join(', ')})`,
      (value: string, previous: string[]) => [...previous, value], [] as string[])
    .option('--push', 'copy missing or stale tags')
    .action(async (selectors: string[], options: { to?: string[]; push?: boolean }) => {
      for (const selector of selectors) {
        if (!/^[a-z0-9][a-z0-9._-]*(?::[A-Za-z0-9_][A-Za-z0-9_.-]*)?$/.test(selector)) throw new Error(`invalid selector ${JSON.stringify(selector)}`);
      }
      validateSelectors(selectors.map((selector) => selector.split(':')[0]));
      syncImageList(root, loadReleases(root), { check: true });
      const lines = readImageList(root).filter((line) => !selectors.length
        || selectors.some((selector) => selector === line || selector === line.split(':')[0]));
      if (selectors.length && !lines.length) throw new Error(`no images.txt line matches ${selectors.join(' ')}`);
      const targets = (options.to?.length ? options.to : defaultTargets).map(parseNamespace);
      useRepositoryDockerConfig();

      const rows: Row[] = [];
      const repositories = new Map<string, RepositoryState>();
      let failed = false;
      try {
        for (const line of lines) {
          const image = line.split(':')[0];
          const from = await regctlDigest(`${source}/${line}`);
          if (from.state !== 'found') throw new Error(`${source}/${line}: ${from.state === 'missing' ? 'not published on GHCR' : from.detail}`);
          for (const namespace of targets) {
            const target = `${namespace}/${line}`;
            const repository = `${namespace}/${image}`;
            if (!repositories.has(repository)) repositories.set(repository, await regctlRepository(repository));
            const state = repositories.get(repository)!;
            if (state.state === 'missing' || state.state === 'private') {
              rows.push({ action: 'skip', ref: target, detail: state.state === 'private'
                ? 'repository is private; make it public first' : 'repository missing or not accessible; create it as public first' });
              continue;
            }
            if (state.state === 'error') {
              failed = true;
              rows.push({ action: 'error', ref: target, detail: state.detail });
              continue;
            }
            const to = await regctlDigest(target);
            if (to.state === 'error') {
              failed = true;
              rows.push({ action: 'error', ref: target, detail: to.detail });
              continue;
            }
            if (to.state === 'found' && to.digest === from.digest) {
              rows.push({ action: 'current', ref: target });
              continue;
            }
            // Canonical tags (always -rN) are immutable: an existing one with another digest is kept and reported.
            if (to.state === 'found' && /-r\d+$/.test(line)) {
              rows.push({ action: 'conflict', ref: target, detail: `keeps ${to.digest}; GHCR has ${from.digest}` });
              continue;
            }
            if (!options.push) {
              rows.push({ action: 'would copy', ref: target, detail: from.digest });
              continue;
            }
            await regctlCopy(`${source}/${image}@${from.digest}`, target);
            const written = await regctlDigest(target);
            if (written.state !== 'found' || written.digest !== from.digest) {
              throw new Error(`${target}: expected ${from.digest} after copy, got ${written.state === 'found' ? written.digest : written.state}`);
            }
            rows.push({ action: 'copied', ref: target, detail: from.digest });
          }
        }
      } finally {
        console.log('ACTION\tREF');
        for (const row of rows) console.log(`${row.action}\t${row.ref}${row.detail ? `\t${row.detail}` : ''}`);
      }
      if (failed) process.exitCode = 1;
    });
}
