import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

interface GitSource {
  name: string;
  current: string;
  repo: string;
  pattern?: RegExp;
  strip?: RegExp;
  stable?: (tag: string) => boolean;
}

function run(command: string, args: string[]) {
  return execFileSync(command, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function readBakeVariable(name: string) {
  const bake = readFileSync('postgres/docker-bake.hcl', 'utf8');
  const match = bake.match(new RegExp(`variable "${name}" \\{ default = "([^"]*)" \\}`));
  return match?.[1] ?? '';
}

function tags(repo: string) {
  const output = run('git', ['ls-remote', '--tags', '--sort=v:refname', `https://github.com/${repo}.git`]);
  return output
    .split('\n')
    .map((line: string) => line.split(/\s+/)[1]?.replace('refs/tags/', ''))
    .filter((tag: string | undefined): tag is string => Boolean(tag))
    .filter((tag: string) => !tag.endsWith('^{}'));
}

function latestTag(source: GitSource) {
  const matches = tags(source.repo)
    .filter((tag: string) => (source.pattern ? source.pattern.test(tag) : true))
    .filter((tag: string) => (source.stable ? source.stable(tag) : !/(alpha|beta|rc)/i.test(tag)));
  return matches.at(-1) ?? '';
}

function latestHead(repo: string, branch: string) {
  const output = run('git', ['ls-remote', `https://github.com/${repo}.git`, `refs/heads/${branch}`]);
  return output.split(/\s+/)[0] ?? '';
}

function latestPostgresAlpine18() {
  const output = run('crane', ['ls', 'docker.io/library/postgres']);
  const tags = output
    .split('\n')
    .filter((tag: string) => /^18\.\d+-alpine3\.24$/.test(tag))
    .sort((a: string, b: string) => a.localeCompare(b, undefined, { numeric: true }));
  return tags.at(-1)?.replace('-alpine3.24', '') ?? '';
}

const sources: GitSource[] = [
  { name: 'PGVECTOR_VERSION', current: readBakeVariable('PGVECTOR_VERSION'), repo: 'pgvector/pgvector', pattern: /^v\d+\.\d+\.\d+$/, strip: /^v/ },
  { name: 'PG_CRON_VERSION', current: readBakeVariable('PG_CRON_VERSION'), repo: 'citusdata/pg_cron', pattern: /^v\d+\.\d+\.\d+$/, strip: /^v/ },
  { name: 'PG_TLE_VERSION', current: readBakeVariable('PG_TLE_VERSION'), repo: 'aws/pg_tle', pattern: /^v\d+\.\d+\.\d+$/, strip: /^v/ },
  { name: 'PG_STAT_MONITOR_VERSION', current: readBakeVariable('PG_STAT_MONITOR_VERSION'), repo: 'percona/pg_stat_monitor', pattern: /^\d+\.\d+\.\d+$/ },
  { name: 'PGAUDIT_VERSION', current: readBakeVariable('PGAUDIT_VERSION'), repo: 'pgaudit/pgaudit', pattern: /^18\.\d+$/ },
  { name: 'PG_HASHIDS_VERSION', current: readBakeVariable('PG_HASHIDS_VERSION'), repo: 'iCyberon/pg_hashids', pattern: /^v\d+\.\d+(\.\d+)?$/, strip: /^v/ },
  { name: 'PGSQL_HTTP_VERSION', current: readBakeVariable('PGSQL_HTTP_VERSION'), repo: 'pramsey/pgsql-http', pattern: /^v\d+\.\d+\.\d+$/, strip: /^v/ },
  { name: 'PG_NET_VERSION', current: readBakeVariable('PG_NET_VERSION'), repo: 'supabase/pg_net', pattern: /^v\d+\.\d+\.\d+$/, strip: /^v/ },
  { name: 'PG_REPACK_VERSION', current: readBakeVariable('PG_REPACK_VERSION'), repo: 'reorg/pg_repack', pattern: /^ver_\d+\.\d+\.\d+$/, strip: /^ver_/ },
  { name: 'PG_PARTMAN_VERSION', current: readBakeVariable('PG_PARTMAN_VERSION'), repo: 'pgpartman/pg_partman', pattern: /^v\d+\.\d+\.\d+$/, strip: /^v/ },
  { name: 'PGMQ_VERSION', current: readBakeVariable('PGMQ_VERSION'), repo: 'tembo-io/pgmq', pattern: /^v\d+\.\d+\.\d+$/, strip: /^v/ },
  { name: 'TIMESCALEDB_VERSION', current: readBakeVariable('TIMESCALEDB_VERSION'), repo: 'timescale/timescaledb', pattern: /^\d+\.\d+\.\d+$/ },
  { name: 'DUCKDB_VERSION', current: readBakeVariable('DUCKDB_VERSION'), repo: 'duckdb/duckdb', pattern: /^v\d+\.\d+\.\d+$/ },
];

const postgres = latestPostgresAlpine18();
console.log(`PG_VERSION current=${readBakeVariable('PG_VERSION')} latestAlpine3.24=${postgres}`);
console.log(`WRAPPERS_REV current=${readBakeVariable('WRAPPERS_REV')} latestDevelop=${latestHead('wenerme/wrappers', 'develop')}`);

for (const source of sources) {
  const tag = latestTag(source);
  const latest = source.strip ? tag.replace(source.strip, '') : tag;
  console.log(`${source.name} current=${source.current} latest=${latest || '(not found)'}`);
}
