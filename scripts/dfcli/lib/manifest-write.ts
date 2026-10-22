import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { renderManifestUpdate, type ManifestUpdatePlan } from './alpine.ts';
import { scanImages } from './bake-scan.ts';
import { parseManifest, resolveManifest, type ImageManifest } from './manifest.ts';
import { syncImageList } from './images-list.ts';
import { syncReadmes } from './readme.ts';
import { root } from './repo.ts';

const manifestFile = path.join(root, 'manifest.yaml');

export function readManifest(): { source: string; manifest: ImageManifest } {
  const source = readFileSync(manifestFile, 'utf8');
  return { source, manifest: parseManifest(source) };
}

/** Print a manifest update plan; with write, apply it to manifest.yaml (comments kept), images.txt and both README regions. */
export async function applyManifestPlan(plan: ManifestUpdatePlan, source: string, options: { write?: boolean; json?: boolean }) {
  const written = Boolean(options.write && plan.changes.length);
  if (written) {
    writeFileSync(manifestFile, renderManifestUpdate(source, plan.manifest));
    const releases = resolveManifest(plan.manifest);
    syncReadmes(root, await scanImages(), releases);
    syncImageList(root, releases);
  }
  if (options.json) {
    console.log(JSON.stringify({ changed: plan.changes.length > 0, written, changes: plan.changes, notes: plan.notes }, null, 2));
    return;
  }
  if (!plan.changes.length) console.log('no manifest changes');
  else {
    console.log('VARIANT\tFROM\tTO\tREASON');
    for (const change of plan.changes) console.log(`${change.id}\t${change.from.tag}\t${change.to.tag}\t${change.reason}`);
  }
  for (const note of plan.notes) console.log(`note: ${note}`);
  if (plan.changes.length) console.log(written ? 'wrote manifest.yaml, images.txt and README regions' : 'preview only; rerun with --write to apply');
}
