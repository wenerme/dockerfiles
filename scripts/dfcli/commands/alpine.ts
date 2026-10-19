import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { Command } from 'commander';
import { fetchAlpineBranches, planAlpineUpdate, renderManifestUpdate } from '../lib/alpine.ts';
import { scanImages } from '../lib/bake-scan.ts';
import { parseManifest, resolveManifest } from '../lib/manifest.ts';
import { syncReadmes } from '../lib/readme.ts';
import { root } from '../lib/repo.ts';

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
      const file = path.join(root, 'manifest.yaml');
      const source = readFileSync(file, 'utf8');
      const plan = planAlpineUpdate(parseManifest(source), await fetchAlpineBranches());
      if (options.write && plan.changes.length) {
        writeFileSync(file, renderManifestUpdate(source, plan.manifest));
        syncReadmes(root, await scanImages(), resolveManifest(plan.manifest));
      }
      if (options.json) {
        console.log(JSON.stringify({ changed: plan.changes.length > 0, written: Boolean(options.write && plan.changes.length), ...plan, manifest: undefined }, null, 2));
        return;
      }
      if (!plan.changes.length) console.log('manifest Alpine versions are current');
      else {
        console.log('VARIANT\tFROM\tTO\tREASON');
        for (const change of plan.changes) console.log(`${change.id}\t${change.from.tag}\t${change.to.tag}\t${change.reason}`);
      }
      for (const note of plan.notes) console.log(`note: ${note}`);
      if (plan.changes.length) console.log(options.write ? 'wrote manifest.yaml and README regions' : 'preview only; rerun with --write to apply');
    });
}
