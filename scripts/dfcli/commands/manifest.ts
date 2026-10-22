import type { Command } from 'commander';
import { planRevisionBump } from '../lib/alpine.ts';
import { generatedBake, inspectBake, loadReleases, selectRelease, validateSelectors } from '../lib/manifest.ts';
import { applyManifestPlan, readManifest } from '../lib/manifest-write.ts';
import { root } from '../lib/repo.ts';

export function registerManifestCommands(program: Command) {
  const manifest = program.command('manifest').description('Validate and preview manifest.yaml');

  manifest
    .command('check')
    .description('Validate manifest versions, references and dependency graph')
    .option('--json', 'print resolved versions as JSON')
    .action((options: { json?: boolean }) => {
      const releases = loadReleases(root);
      console.log(options.json ? JSON.stringify(releases, null, 2)
        : `manifest valid: ${releases.length} variants; build order: ${releases.map((release) => release.id).join(' -> ')}`);
    });

  manifest
    .command('bake')
    .description('Print a GHCR-only Bake JSON preview; no build, file write or publication')
    .argument('<image>', 'image or image.variant')
    .action(async (selector: string) => {
      const releases = loadReleases(root);
      const release = selectRelease(releases, selector);
      console.log(JSON.stringify(generatedBake(await inspectBake(root, release), release, releases), null, 2));
    });

  manifest
    .command('bump')
    .description('Increment the revision of the selected variants and propagate to every dependent; preview unless --write')
    .argument('<images...>', 'image or image.variant whose content changed, e.g. base')
    .option('--write', 'write manifest.yaml and regenerate the README regions')
    .option('--json', 'print the planned changes as JSON')
    .action(async (selectors: string[], options: { write?: boolean; json?: boolean }) => {
      validateSelectors(selectors);
      const { source, manifest: parsed } = readManifest();
      await applyManifestPlan(planRevisionBump(parsed, selectors), source, options);
    });
}
