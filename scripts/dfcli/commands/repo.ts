import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { Command } from 'commander';
import { scanImages, type ImageInfo } from '../lib/bake-scan.ts';
import { loadReleases, replaceReadmeRegion } from '../lib/manifest.ts';
import { generateReadme } from '../lib/readme.ts';
import { rel, root } from '../lib/repo.ts';

function summarizeTargets(info: ImageInfo) {
  const targets = info.defaultTargets.length ? info.defaultTargets : info.targets.map((target) => target.name);
  return targets.length ? targets.join(', ') : '-';
}

/** Repository-wide inventory: Bake scan and the generated README region. */
export function registerRepoCommands(program: Command) {
  program
    .command('scan')
    .description('Scan tracked docker-bake.hcl files')
    .option('--json', 'print JSON')
    .action(async (options: { json?: boolean }) => {
      const images = await scanImages();
      if (options.json) {
        console.log(JSON.stringify(images, null, 2));
        return;
      }
      for (const image of images) {
        console.log(`${image.name}\t${image.dir}\t${summarizeTargets(image)}\t${image.registries.join(',') || '-'}`);
      }
    });

  program
    .command('readme')
    .description('Update the generated README region from manifest and tracked Bake metadata')
    .option('--check', 'fail if the generated region is out of date; do not write')
    .action(async (options: { check?: boolean }) => {
      const images = await scanImages();
      const out = path.join(root, 'README.md');
      const before = readFileSync(out, 'utf8');
      const after = replaceReadmeRegion(before, generateReadme(images, loadReleases(root)));
      if (options.check && before !== after) throw new Error('README generated region is out of date; run just readme');
      if (!options.check && before !== after) writeFileSync(out, after);
      const state = options.check ? 'checked' : before === after ? 'unchanged' : 'updated';
      console.log(`${state} ${rel(out)} generated region (${images.length} image groups)`);
    });
}
