import type { Command } from 'commander';
import { fetchAlpineBranches, planAlpineUpdate } from '../lib/alpine.ts';
import { applyManifestPlan, readManifest } from '../lib/manifest-write.ts';

/** Alpine patch maintenance for manifest-managed variants. */
export function registerAlpineCommands(program: Command) {
  program
    .command('alpine')
    .description('Alpine release helpers for manifest-managed variants')
    .command('update')
    .description('Move explicit Alpine versions to the newest patch on their branch and propagate revisions; preview unless --write')
    .option('--write', 'write manifest.yaml and regenerate the README regions')
    .option('--json', 'print the planned changes as JSON')
    .action(async (options: { write?: boolean; json?: boolean }) => {
      const { source, manifest } = readManifest();
      await applyManifestPlan(planAlpineUpdate(manifest, await fetchAlpineBranches()), source, options);
    });
}
