#!/usr/bin/env bash
# Upgrade drill: a data directory created by an older published image must keep working when the
# new image starts on it WITHOUT `ALTER EXTENSION ... UPDATE`, must still start on the old image
# afterwards (rollback), and must then update cleanly.
#
#   upgrade-test.sh <new-image> [old-image...]
#
# Old images default to the published tags that existing databases were created with.
# TEST_PLATFORM (e.g. linux/amd64) selects a platform of multi-platform tags.
# No -e: a failing check must be reported, not end the run silently.
set -uo pipefail

NEW="${1:?usage: upgrade-test.sh <new-image> [old-image...]}"
shift
OLD_IMAGES=("$@")
[[ ${#OLD_IMAGES[@]} -eq 0 ]] && OLD_IMAGES=(quay.io/wener/postgres:18.3-r1 quay.io/wener/postgres:18.3-r0)

PLATFORM_ARGS=()
[[ -n "${TEST_PLATFORM:-}" ]] && PLATFORM_ARGS=(--platform "$TEST_PLATFORM")
C="pg-upgrade-test-$$"
VOL="pg-upgrade-test-$$"
PASS=0
FAIL=0

log()  { printf "\033[1;34m[UPGRADE]\033[0m %s\n" "$@"; }
ok()   { PASS=$((PASS+1)); printf "\033[1;32m  ✓ %s\033[0m\n" "$@"; }
fail() { FAIL=$((FAIL+1)); printf "\033[1;31m  ✗ %s\033[0m\n" "$@"; }
cleanup() { docker rm -f "$C" &>/dev/null || true; docker volume rm -f "$VOL" &>/dev/null || true; }
trap cleanup EXIT

# The getkey GUCs are explicit: images before 18.3-r2 have no default-path getkey script.
PG_ARGS=(postgres
  -c shared_preload_libraries=timescaledb,pg_cron,pg_tle,pg_net,pgaudit,pg_stat_monitor,pgsodium,supabase_vault
  -c cron.database_name=postgres
  -c timescaledb.telemetry_level=off
  -c pgsodium.getkey_script=/usr/local/bin/pgsodium_getkey.sh
  -c vault.getkey_script=/usr/local/bin/pgsodium_getkey.sh)

sql() { docker exec -i "$C" psql -U postgres -qAtX -v ON_ERROR_STOP=1 "$@" 2>&1; }
check() { # check <label> <expected> <sql>; stdin, so several statements are not one transaction
  local got; got=$(printf '%s\n' "$3" | sql)
  if [[ "$got" == "$2" ]]; then ok "$1"; else fail "$1: expected '$2', got '$got'"; fi
}

up() { # up <image>: start on the shared volume and wait until the real server accepts TCP connections
  docker rm -f "$C" &>/dev/null || true
  docker pull -q "${PLATFORM_ARGS[@]}" "$1" >/dev/null 2>&1 || docker image inspect "$1" >/dev/null || return 1
  docker run -d "${PLATFORM_ARGS[@]}" --name "$C" -e POSTGRES_PASSWORD=test -e POSTGRES_HOST_AUTH_METHOD=trust \
    -v "$VOL:/var/lib/postgresql" "$1" "${PG_ARGS[@]}" >/dev/null || return 1
  for _ in $(seq 1 60); do
    docker exec "$C" pg_isready -h 127.0.0.1 -U postgres -q &>/dev/null && return 0
    sleep 1
  done
  docker logs "$C" 2>&1 | tail -15
  return 1
}
down() { docker stop -t 60 "$C" >/dev/null 2>&1; docker rm -f "$C" &>/dev/null || true; }

# Objects created on the old image; each extension that keeps state or a background worker is used.
SEED=$(cat <<'SQL'
CREATE EXTENSION timescaledb;
CREATE TABLE metrics (time timestamptz NOT NULL, device int, value double precision);
SELECT create_hypertable('metrics', by_range('time', interval '1 day'));
INSERT INTO metrics SELECT t, (extract(epoch FROM t)::int / 60) % 4, random()
  FROM generate_series(now() - interval '5 days', now(), interval '1 minute') t;
CREATE MATERIALIZED VIEW metrics_daily WITH (timescaledb.continuous) AS
  SELECT time_bucket('1 day', time) AS day, device, avg(value) AS avg FROM metrics GROUP BY 1, 2 WITH NO DATA;
SELECT add_continuous_aggregate_policy('metrics_daily', start_offset => interval '10 days',
  end_offset => interval '1 hour', schedule_interval => interval '1 hour');
CALL refresh_continuous_aggregate('metrics_daily', NULL, NULL);
ALTER TABLE metrics SET (timescaledb.compress, timescaledb.compress_segmentby = 'device');
SELECT count(compress_chunk(c)) FROM show_chunks('metrics', older_than => interval '2 days') c;
CREATE EXTENSION pgsodium;
CREATE EXTENSION supabase_vault CASCADE;
SELECT vault.create_secret('upgrade-probe', 'probe');
CREATE EXTENSION pg_cron;
SELECT cron.schedule('probe', '*/5 * * * *', 'SELECT 1');
CREATE EXTENSION pg_net;
CREATE EXTENSION pg_stat_monitor;
CREATE EXTENSION pg_tle;
CREATE EXTENSION pgaudit;
CREATE EXTENSION wrappers;
CREATE FOREIGN DATA WRAPPER mysql_wrapper HANDLER mysql_fdw_handler VALIDATOR mysql_fdw_validator;
CREATE SERVER mysql_probe FOREIGN DATA WRAPPER mysql_wrapper OPTIONS (conn_string 'mysql://u:p@127.0.0.1:3306/db');
CREATE EXTENSION pgmq;
SELECT pgmq.create('probe');
SELECT pgmq.send('probe', '{"k":1}');
CREATE EXTENSION vector;
CREATE TABLE items (id int, emb vector(3));
INSERT INTO items VALUES (1, '[1,2,3]');
CREATE SCHEMA partman;
CREATE EXTENSION pg_partman SCHEMA partman;
CREATE EXTENSION pg_hashids;
CREATE EXTENSION http;
SQL
)

# Every C function of an installed extension must still resolve in the library this image ships.
C_FUNCTIONS_OK=$(cat <<'SQL'
DO $$
DECLARE f record; bad text := '';
BEGIN
  FOR f IN SELECT DISTINCT p.oid, e.extname, p.probin, p.prosrc
    FROM pg_proc p JOIN pg_language l ON l.oid = p.prolang AND l.lanname = 'c'
    JOIN pg_depend d ON d.classid = 'pg_proc'::regclass AND d.objid = p.oid AND d.deptype = 'e'
    JOIN pg_extension e ON e.oid = d.refobjid
  LOOP
    BEGIN
      PERFORM fmgr_c_validator(f.oid);
    EXCEPTION WHEN OTHERS THEN
      bad := bad || format(E'\n    %s %s(%s): %s', f.extname, f.prosrc, f.probin, SQLERRM);
    END;
  END LOOP;
  IF bad <> '' THEN RAISE EXCEPTION 'unresolved C functions:%', bad; END IF;
END $$;
SELECT 'ok';
SQL
)

snapshot() { # expected row counts for later restarts
  local v
  v=$(sql -c "SELECT count(*) FROM metrics;") && [[ "$v" =~ ^[0-9]+$ ]] && ROWS=$v
  v=$(sql -c "SELECT count(*) FROM metrics WHERE time < now() - interval '3 days';") && [[ "$v" =~ ^[0-9]+$ ]] && COMPRESSED_ROWS=$v
  v=$(sql -c "SELECT count(*) FROM metrics_daily;") && [[ "$v" =~ ^[0-9]+$ ]] && CAGG_ROWS=$v
  return 0
}

verify_data() { # shared checks after any restart
  check "hypertable rows" "$ROWS" "SELECT count(*) FROM metrics;"
  check "compressed chunks readable" "$COMPRESSED_ROWS" \
    "SELECT count(*) FROM metrics WHERE time < now() - interval '3 days';"
  check "continuous aggregate" "$CAGG_ROWS" "SELECT count(*) FROM metrics_daily;"
  check "vault secret decrypts" "upgrade-probe" "SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'probe';"
}

for OLD in "${OLD_IMAGES[@]}"; do
  log "$OLD -> $NEW"
  docker volume rm -f "$VOL" &>/dev/null || true
  docker volume create "$VOL" >/dev/null

  if ! up "$OLD"; then fail "old image $OLD did not start"; continue; fi
  if out=$(printf '%s\n' "$SEED" | sql); then ok "seeded on $OLD"; else fail "seed on $OLD: $out"; down; continue; fi
  OLD_VERSIONS=$(sql -c "SELECT string_agg(extname || '=' || extversion, ' ' ORDER BY extname) FROM pg_extension;")
  echo "  old: $OLD_VERSIONS"
  ROWS=0 COMPRESSED_ROWS=0 CAGG_ROWS=0
  snapshot
  down

  log "new image on the old data directory, no ALTER EXTENSION"
  if ! up "$NEW"; then fail "new image did not start on the old data directory"; continue; fi
  ok "new image started"
  check "extension versions unchanged" "$OLD_VERSIONS" \
    "SELECT string_agg(extname || '=' || extversion, ' ' ORDER BY extname) FROM pg_extension;"
  verify_data
  check "insert into a compressed chunk" "1" \
    "WITH i AS (INSERT INTO metrics VALUES (now() - interval '4 days', 9, 1) RETURNING 1) SELECT count(*) FROM i;"
  check "continuous aggregate refresh" "ok" "CALL refresh_continuous_aggregate('metrics_daily', NULL, NULL); SELECT 'ok';"
  # Later checks expect what the new image wrote; keep the old counts if it could not read them.
  snapshot
  check "vault.create_secret" "1" \
    "SELECT count(*) FROM (SELECT vault.create_secret('second', 'probe2')) s;"
  check "pgsodium crypto" "32" "SELECT length(pgsodium.crypto_secretbox_keygen());"
  check "pg_cron job kept" "SELECT 1" "SELECT command FROM cron.job WHERE jobname = 'probe';"
  check "pg_cron launcher" "1" "SELECT count(*) FROM pg_stat_activity WHERE backend_type = 'pg_cron launcher';"
  check "pg_net queue" "t" "SELECT net.http_get('http://127.0.0.1:1/') > 0;"
  check "pg_stat_monitor view" "t" "SELECT count(*) >= 0 FROM pg_stat_monitor;"
  check "pgmq read" "1" "SELECT message->>'k' FROM pgmq.read('probe', 30, 1);"
  check "vector distance" "0" "SELECT emb <-> '[1,2,3]' FROM items;"
  check "wrappers server" "mysql_probe" "SELECT srvname FROM pg_foreign_server;"
  check "all extension C functions resolve" "ok" "$C_FUNCTIONS_OK"
  ERRORS=$(docker logs "$C" 2>&1 | grep -E 'could not (access|load)|undefined symbol|PANIC|terminated by signal' || true)
  if [[ -z "$ERRORS" ]]; then ok "no load errors in the server log"
  else fail "server log ($(printf '%s\n' "$ERRORS" | wc -l | tr -d ' ') lines): $(printf '%s\n' "$ERRORS" | sed -E 's/^.*(ERROR|FATAL|PANIC|LOG): +//' | sort | uniq -c | head -5)"; fi
  down

  log "rollback: old image on the data directory the new image ran on"
  if up "$OLD"; then ok "old image started again"; verify_data; else fail "old image did not start after the new one"; fi
  down

  log "ALTER EXTENSION ... UPDATE on the new image"
  if ! up "$NEW"; then fail "new image did not start for the update"; continue; fi
  # timescaledb must be updated first, as the first command of a fresh session.
  if ! outdated=$(sql -c "SELECT e.extname FROM pg_extension e JOIN pg_available_extensions a ON a.name = e.extname
      WHERE e.extversion <> a.default_version ORDER BY e.extname <> 'timescaledb', e.extname;"); then
    fail "list outdated extensions: $outdated"; down; continue
  fi
  for ext in $outdated; do
    if out=$(sql -c "ALTER EXTENSION \"$ext\" UPDATE;"); then ok "ALTER EXTENSION $ext UPDATE"; else fail "ALTER EXTENSION $ext UPDATE: $out"; fi
  done
  check "every extension at the image default" "" \
    "SELECT string_agg(e.extname || '=' || e.extversion, ' ') FROM pg_extension e
       JOIN pg_available_extensions a ON a.name = e.extname WHERE e.extversion <> a.default_version;"
  verify_data
  check "all extension C functions resolve after update" "ok" "$C_FUNCTIONS_OK"
  down
done

echo ""
log "Results: $PASS passed, $FAIL failed"
[[ "$FAIL" -eq 0 ]]
