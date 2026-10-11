import type { Command } from 'commander';
import { scanImages, type ImageInfo } from '../lib/bake-scan.ts';
import { loadReleases } from '../lib/manifest.ts';
import { syncReadmes } from '../lib/readme.ts';
import { root } from '../lib/repo.ts';

function summarizeTargets(info: ImageInfo) {
  const targets = info.defaultTargets.length ? info.defaultTargets : info.targets.map((target) => target.name);
  return targets.length ? targets.join(', ') : '-';
}

/** Repository-wide inventory: Bake scan and the generated README regions. */
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
    .description('Update the generated English and Chinese README regions from manifest and tracked Bake metadata')
    .option('--check', 'fail if either generated region is out of date; do not write')
    .action(async (options: { check?: boolean }) => {
      const images = await scanImages();
      for (const { file, state } of syncReadmes(root, images, loadReleases(root), options)) {
        console.log(`${state} ${file} generated region (${images.length} image groups)`);
      }
    });
}
