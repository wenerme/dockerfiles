import { readFileSync } from 'node:fs';
import path from 'node:path';
import { $ } from 'bun';
import type { Command } from 'commander';
import { findImage, scanImages } from '../lib/bake-scan.ts';
import { root } from '../lib/repo.ts';
import { bumpRevision, checkBaseDigests } from '../lib/revision.ts';

interface UpstreamSource {
  name: string;
  repo: string;
  pattern: RegExp;
  strip?: RegExp;
}

// Upstream tag sources for postgres extensions; the bake variable name is the key.
const postgresSources: UpstreamSource[] = [
  { name: 'PGVECTOR_VERSION', repo: 'pgvector/pgvector', pattern: /^v\d+\.\d+\.\d+$/, strip: /^v/ },
  { name: 'PG_CRON_VERSION', repo: 'citusdata/pg_cron', pattern: /^v\d+\.\d+\.\d+$/, strip: /^v/ },
  { name: 'PG_TLE_VERSION', repo: 'aws/pg_tle', pattern: /^v\d+\.\d+\.\d+$/, strip: /^v/ },
  { name: 'PG_STAT_MONITOR_VERSION', repo: 'percona/pg_stat_monitor', pattern: /^\d+\.\d+\.\d+$/ },
  { name: 'PGAUDIT_VERSION', repo: 'pgaudit/pgaudit', pattern: /^18\.\d+$/ },
  { name: 'PG_HASHIDS_VERSION', repo: 'iCyberon/pg_hashids', pattern: /^v\d+\.\d+(\.\d+)?$/, strip: /^v/ },
  { name: 'PGSQL_HTTP_VERSION', repo: 'pramsey/pgsql-http', pattern: /^v\d+\.\d+\.\d+$/, strip: /^v/ },
  { name: 'PG_NET_VERSION', repo: 'supabase/pg_net', pattern: /^v\d+\.\d+\.\d+$/, strip: /^v/ },
  { name: 'PG_REPACK_VERSION', repo: 'reorg/pg_repack', pattern: /^ver_\d+\.\d+\.\d+$/, strip: /^ver_/ },
  { name: 'PG_PARTMAN_VERSION', repo: 'pgpartman/pg_partman', pattern: /^v\d+\.\d+\.\d+$/, strip: /^v/ },
  { name: 'PGMQ_VERSION', repo: 'tembo-io/pgmq', pattern: /^v\d+\.\d+\.\d+$/, strip: /^v/ },
  { name: 'TIMESCALEDB_VERSION', repo: 'timescale/timescaledb', pattern: /^\d+\.\d+\.\d+$/ },
  { name: 'DUCKDB_VERSION', repo: 'duckdb/duckdb', pattern: /^v\d+\.\d+\.\d+$/ },
];

async function latestStableTag(source: UpstreamSource) {
  const output = await $`git ls-remote --tags --sort=v:refname ${`https://github.com/${source.repo}.git`}`.quiet().text();
  const tag = output.split('\n')
    .map((line) => line.split(/\s+/)[1]?.replace('refs/tags/', ''))
    .filter((item): item is string => Boolean(item) && !item!.endsWith('^{}'))
    .filter((item) => source.pattern.test(item) && !/(alpha|beta|rc)/i.test(item))
    .at(-1) ?? '';
  return source.strip ? tag.replace(source.strip, '') : tag;
}

async function postgresVersions() {
  const bake = readFileSync(path.join(root, 'postgres/docker-bake.hcl'), 'utf8');
  const current = (name: string) => bake.match(new RegExp(`variable "${name}" \\{ default = "([^"]*)" \\}`))?.[1] ?? '';
  const [postgresTags, wrappersHead, ...latest] = await Promise.all([
    $`crane ls docker.io/library/postgres`.quiet().text(),
    $`git ls-remote https://github.com/wenerme/wrappers.git refs/heads/develop`.quiet().text(),
    ...postgresSources.map(latestStableTag),
  ]);
  const postgres = postgresTags.split('\n')
    .filter((tag) => /^18\.\d+-alpine3\.24$/.test(tag))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .at(-1)?.replace('-alpine3.24', '') ?? '';
  console.log(`PG_VERSION current=${current('PG_VERSION')} latestAlpine3.24=${postgres}`);
  console.log(`WRAPPERS_REV current=${current('WRAPPERS_REV')} latestDevelop=${wrappersHead.split(/\s+/)[0] ?? ''}`);
  for (const [index, source] of postgresSources.entries()) {
    console.log(`${source.name} current=${current(source.name)} latest=${latest[index] || '(not found)'}`);
  }
}

/** Revision maintenance for images still configured by their own Bake files. */
export function registerMaintainCommands(program: Command) {
  program
    .command('rev')
    .description('Image revision helpers')
    .command('bump')
    .description('Preview or write an image revision bump in docker-bake.hcl')
    .argument('<image>', 'image name or directory, e.g. postgres or base/base')
    .option('--write', 'write the bump to docker-bake.hcl')
    .option('--rev-var <name>', 'revision variable name, e.g. REV or PG_REVISION')
    .action(async (imageRef: string, options: { write?: boolean; revVar?: string }) => {
      const info = findImage(await scanImages(), imageRef);
      if (!info) throw new Error(`unknown image: ${imageRef}`);
      const result = bumpRevision(info, { variable: options.revVar, write: Boolean(options.write) });
      console.log(JSON.stringify({ image: info.name, dir: info.dir, ...result }, null, 2));
    });

  program
    .command('base')
    .description('Upstream base image helpers')
    .command('check')
    .description('Check upstream base image digests and optionally bump the revision on changes')
    .argument('<image>', 'image name or directory, e.g. postgres or base/base')
    .option('--write', 'write digest state and revision bump')
    .option('--bump', 'bump revision when an existing tracked base digest changed')
    .option('--state <path>', 'digest state path', '.github/image-base-digests.json')
    .option('--rev-var <name>', 'revision variable name, e.g. REV or PG_REVISION')
    .action(async (imageRef: string, options: { write?: boolean; bump?: boolean; state?: string; revVar?: string }) => {
      console.log(JSON.stringify(await checkBaseDigests(await scanImages(), imageRef, options), null, 2));
    });

  program
    .command('postgres')
    .description('Postgres image helpers')
    .command('versions')
    .description('Compare postgres extension versions in docker-bake.hcl with upstream')
    .action(postgresVersions);
}
