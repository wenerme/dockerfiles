#!/usr/bin/env bash
# No -e: a failing or crashing check must be reported, not end the run silently.
set -uo pipefail

IMAGE="${1:-wener/postgres:18}"
# Optional, e.g. linux/amd64: test another platform of a multi-platform tag (emulated).
PLATFORM_ARGS=()
[[ -n "${TEST_PLATFORM:-}" ]] && PLATFORM_ARGS=(--platform "$TEST_PLATFORM")
CONTAINER="pg-ext-test-$$"
PASS=0
FAIL=0

cleanup() {
  docker rm -f "$CONTAINER" &>/dev/null || true
}
trap cleanup EXIT

log()  { printf "\033[1;34m[TEST]\033[0m %s\n" "$@"; }
ok()   { PASS=$((PASS+1)); printf "\033[1;32m  ✓ %s\033[0m\n" "$@"; }
fail() { FAIL=$((FAIL+1)); printf "\033[1;31m  ✗ %s\033[0m\n" "$@"; }

psql_exec() {
  docker exec "$CONTAINER" psql -U postgres -tAc "$1" 2>&1
}

# ── start container ─────────────────────────────────────────────
log "Starting container from $IMAGE"
# Pull first so the readiness timeout measures PostgreSQL, not the download.
docker pull -q "${PLATFORM_ARGS[@]}" "$IMAGE" >/dev/null 2>&1 || docker image inspect "$IMAGE" >/dev/null || { fail "cannot pull $IMAGE"; exit 1; }
docker run "${PLATFORM_ARGS[@]}" --rm -d \
  --name "$CONTAINER" \
  -e POSTGRES_PASSWORD=test \
  -e POSTGRES_HOST_AUTH_METHOD=trust \
  "$IMAGE" \
  postgres \
    -c shared_preload_libraries=timescaledb,pg_cron,pg_tle,pg_net,pgaudit,pg_stat_monitor,pg_partman_bgw \
    -c cron.database_name=postgres \
    -c timescaledb.telemetry_level=off \
  >/dev/null

log "Waiting for PostgreSQL to be ready..."
for i in $(seq 1 30); do
  # TCP, not the socket: the entrypoint's temporary init server listens on the socket only.
  if docker exec "$CONTAINER" pg_isready -h 127.0.0.1 -U postgres &>/dev/null; then
    break
  fi
  sleep 1
done

if ! docker exec "$CONTAINER" pg_isready -h 127.0.0.1 -U postgres &>/dev/null; then
  fail "PostgreSQL did not become ready in 30s"
  docker logs "$CONTAINER" 2>&1 | tail -30
  exit 1
fi
ok "PostgreSQL is ready"

# ── check server version ────────────────────────────────────────
log "Checking PostgreSQL version"
PG_VER=$(psql_exec "SHOW server_version;")
echo "  server_version = $PG_VER"
if [[ "$PG_VER" == 18.* ]]; then ok "PostgreSQL 18.x"; else fail "Expected PG 18.x, got $PG_VER"; fi

# ── test: pgvector ──────────────────────────────────────────────
log "Testing pgvector (vector)"
psql_exec "CREATE EXTENSION IF NOT EXISTS vector;" >/dev/null && ok "CREATE EXTENSION vector" || fail "CREATE EXTENSION vector"

VDIST=$(psql_exec "SELECT ('[1,2,3]'::vector <-> '[4,5,6]'::vector)::numeric(10,2);")
if [[ "$VDIST" == "5.20" ]]; then ok "vector distance calculation"; else fail "vector distance: expected 5.20, got $VDIST"; fi

psql_exec "CREATE TABLE IF NOT EXISTS _test_vec (id serial PRIMARY KEY, emb vector(3));" >/dev/null
psql_exec "INSERT INTO _test_vec (emb) VALUES ('[1,0,0]'), ('[0,1,0]'), ('[0,0,1]');" >/dev/null
psql_exec "CREATE INDEX IF NOT EXISTS _test_vec_hnsw ON _test_vec USING hnsw (emb vector_cosine_ops);" >/dev/null \
  && ok "HNSW index creation" || fail "HNSW index creation"

# ── test: supabase wrappers ─────────────────────────────────────
log "Testing supabase wrappers"
psql_exec "CREATE EXTENSION IF NOT EXISTS wrappers;" >/dev/null && ok "CREATE EXTENSION wrappers" || fail "CREATE EXTENSION wrappers"

WRAPPERS_VER=$(psql_exec "SELECT extversion FROM pg_extension WHERE extname = 'wrappers';")
echo "  wrappers = $WRAPPERS_VER"
for handler in click_house duckdb mysql prometheus redis s3 s3_vectors tencent_cls; do
  N=$(psql_exec "SELECT count(*) FROM pg_proc WHERE proname = '${handler}_fdw_handler';")
  if [[ "$N" == "1" ]]; then ok "${handler}_fdw_handler"; else fail "${handler}_fdw_handler missing"; fi
done

psql_exec "CREATE FOREIGN DATA WRAPPER _test_mysql_wrapper HANDLER mysql_fdw_handler VALIDATOR mysql_fdw_validator;" >/dev/null \
  && ok "CREATE FOREIGN DATA WRAPPER (mysql_fdw_handler)" || fail "CREATE FOREIGN DATA WRAPPER (mysql_fdw_handler)"
psql_exec "CREATE SERVER _test_mysql FOREIGN DATA WRAPPER _test_mysql_wrapper OPTIONS (conn_string 'mysql://u:p@127.0.0.1:3306/db');" >/dev/null \
  && ok "CREATE SERVER with mysql wrapper" || fail "CREATE SERVER with mysql wrapper"

# Databases created by earlier images still reference wrappers 0.6.0.
UPGRADE=$(psql_exec "SELECT count(*) FROM pg_extension_update_paths('wrappers') WHERE source = '0.6.0' AND target = '$WRAPPERS_VER' AND path IS NOT NULL;")
if [[ "$WRAPPERS_VER" == "0.6.0" || "$UPGRADE" == "1" ]]; then ok "wrappers update path 0.6.0 -> $WRAPPERS_VER"; else fail "no wrappers update path 0.6.0 -> $WRAPPERS_VER"; fi
psql_exec "LOAD '\$libdir/wrappers-0.6.0';" >/dev/null && ok "wrappers-0.6.0 library still loadable" || fail "LOAD wrappers-0.6.0"

# ── test: timescaledb ───────────────────────────────────────────
log "Testing timescaledb"
psql_exec "CREATE EXTENSION IF NOT EXISTS timescaledb;" >/dev/null && ok "CREATE EXTENSION timescaledb" || fail "CREATE EXTENSION timescaledb"
psql_exec "CREATE TABLE _test_metrics (time timestamptz NOT NULL, value double precision);" >/dev/null
HT=$(psql_exec "SELECT count(*) FROM create_hypertable('_test_metrics', by_range('time'));")
if [[ "$HT" == "1" ]]; then ok "create_hypertable()"; else fail "create_hypertable(): $HT"; fi

# ── test: pgmq / pg_partman ─────────────────────────────────────
log "Testing pgmq and pg_partman"
psql_exec "CREATE EXTENSION IF NOT EXISTS pgmq;" >/dev/null && ok "CREATE EXTENSION pgmq" || fail "CREATE EXTENSION pgmq"
psql_exec "SELECT pgmq.create('_test_q');" >/dev/null
psql_exec "SELECT pgmq.send('_test_q', '{\"k\":1}'::jsonb);" >/dev/null
MSG=$(psql_exec "SELECT message->>'k' FROM pgmq.read('_test_q', 30, 1);")
if [[ "$MSG" == "1" ]]; then ok "pgmq send/read"; else fail "pgmq read: $MSG"; fi
psql_exec "CREATE SCHEMA IF NOT EXISTS partman; CREATE EXTENSION IF NOT EXISTS pg_partman SCHEMA partman;" >/dev/null \
  && ok "CREATE EXTENSION pg_partman" || fail "CREATE EXTENSION pg_partman"

# ── test: pljs / pg_wodekit ─────────────────────────────────────
log "Testing pljs and pg_wodekit"
psql_exec "CREATE EXTENSION IF NOT EXISTS pljs;" >/dev/null && ok "CREATE EXTENSION pljs" || fail "CREATE EXTENSION pljs"
psql_exec "CREATE FUNCTION _test_js(a int) RETURNS int LANGUAGE pljs AS 'return a * 2;';" >/dev/null
JS=$(psql_exec "SELECT _test_js(21);")
if [[ "$JS" == "42" ]]; then ok "pljs function"; else fail "pljs function: $JS"; fi
psql_exec "CREATE EXTENSION IF NOT EXISTS pg_wodekit;" >/dev/null && ok "CREATE EXTENSION pg_wodekit" || fail "CREATE EXTENSION pg_wodekit"

# ── test: DuckDB extensions for duckdb_fdw ──────────────────────
log "Testing DuckDB extensions"
HTTPFS=$(docker exec "$CONTAINER" sh -c 'ls /usr/local/lib/duckdb/extensions/*/*/httpfs.duckdb_extension 2>/dev/null')
if [[ $(printf '%s\n' "$HTTPFS" | grep -c .) == "1" ]]; then ok "httpfs at ${HTTPFS#/usr/local/lib/duckdb/extensions/}"; else fail "expected one httpfs extension, got: $HTTPFS"; fi

# ── test: portable binaries ─────────────────────────────────────
# A build runner's CPU features must not leak into the image: -march=native on an SVE runner
# makes extensions crash with SIGILL on arm64 CPUs without SVE.
log "Testing portable binaries"
ARCH=$(docker exec "$CONTAINER" uname -m)
if [[ "$ARCH" == "aarch64" ]]; then
  SVE=$(docker exec "$CONTAINER" sh -c 'apk add -q binutils >/dev/null 2>&1 || exit 2
    for f in /usr/local/lib/postgresql/*.so /usr/local/lib/duckdb/extensions/*/*/*.duckdb_extension; do
      n=$(objdump -d "$f" | grep -cwE "ptrue|whilelo|whilelt"); [ "$n" -gt 0 ] && echo "${f##*/}:$n"
    done; true')
  if [[ $? -ne 0 ]]; then fail "binutils not installable for the SVE scan"
  elif [[ -z "$SVE" ]]; then ok "no SVE instructions in extensions"
  else fail "SVE instructions (build CPU leaked): $SVE"; fi
else
  ok "SVE scan skipped on $ARCH"
fi

# ── test: pg_cron ───────────────────────────────────────────────
log "Testing pg_cron"
psql_exec "CREATE EXTENSION IF NOT EXISTS pg_cron;" >/dev/null && ok "CREATE EXTENSION pg_cron" || fail "CREATE EXTENSION pg_cron"

JOB_ID=$(psql_exec "SELECT cron.schedule('_test_job', '*/5 * * * *', 'SELECT 1');")
if [[ -n "$JOB_ID" ]]; then ok "cron.schedule() returned job $JOB_ID"; else fail "cron.schedule() returned empty"; fi

JOB_CMD=$(psql_exec "SELECT command FROM cron.job WHERE jobname = '_test_job';")
if [[ "$JOB_CMD" == "SELECT 1" ]]; then ok "cron.job contains scheduled job"; else fail "cron.job query failed: $JOB_CMD"; fi

psql_exec "SELECT cron.unschedule('_test_job');" >/dev/null && ok "cron.unschedule()" || fail "cron.unschedule()"

BG=$(psql_exec "SELECT count(*) FROM pg_stat_activity WHERE backend_type = 'pg_cron launcher';")
if [[ "$BG" == "1" ]]; then ok "pg_cron background worker running"; else fail "pg_cron background worker not found (count=$BG)"; fi

# ── test: pg_tle ────────────────────────────────────────────────
log "Testing pg_tle"
psql_exec "CREATE EXTENSION IF NOT EXISTS pg_tle;" >/dev/null && ok "CREATE EXTENSION pg_tle" || fail "CREATE EXTENSION pg_tle"

TLE_FN=$(psql_exec "SELECT count(*) FROM pg_proc WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'pgtle');")
if [[ "$TLE_FN" -gt 0 ]]; then ok "pgtle schema has $TLE_FN functions"; else fail "pgtle schema has no functions"; fi

# ── test: pg_stat_monitor ───────────────────────────────────────
log "Testing pg_stat_monitor"
psql_exec "CREATE EXTENSION IF NOT EXISTS pg_stat_monitor;" >/dev/null && ok "CREATE EXTENSION pg_stat_monitor" || fail "CREATE EXTENSION pg_stat_monitor"

PGSM=$(psql_exec "SELECT count(*) FROM pg_stat_monitor;")
if [[ "$PGSM" -ge 0 ]]; then ok "pg_stat_monitor view queryable ($PGSM rows)"; else fail "pg_stat_monitor view query failed"; fi

# ── test: pgaudit ───────────────────────────────────────────────
log "Testing pgaudit"
psql_exec "CREATE EXTENSION IF NOT EXISTS pgaudit;" >/dev/null && ok "CREATE EXTENSION pgaudit" || fail "CREATE EXTENSION pgaudit"

AUDIT_VER=$(psql_exec "SELECT extversion FROM pg_extension WHERE extname = 'pgaudit';")
if [[ -n "$AUDIT_VER" ]]; then ok "pgaudit version $AUDIT_VER"; else fail "pgaudit not found in pg_extension"; fi

# ── test: pg_hashids ────────────────────────────────────────────
log "Testing pg_hashids"
psql_exec "CREATE EXTENSION IF NOT EXISTS pg_hashids;" >/dev/null && ok "CREATE EXTENSION pg_hashids" || fail "CREATE EXTENSION pg_hashids"

HASH=$(psql_exec "SELECT id_encode(123, 'salt');")
if [[ -n "$HASH" ]]; then ok "id_encode(123) = $HASH"; else fail "id_encode() returned empty"; fi

DECODED=$(psql_exec "SELECT id_decode('$HASH', 'salt');")
if [[ "$DECODED" == "{123}" ]]; then ok "id_decode() roundtrip"; else fail "id_decode() expected {123}, got $DECODED"; fi

# ── test: pgsql-http ────────────────────────────────────────────
log "Testing pgsql-http (http)"
psql_exec "CREATE EXTENSION IF NOT EXISTS http;" >/dev/null && ok "CREATE EXTENSION http" || fail "CREATE EXTENSION http"

HTTP_FN=$(psql_exec "SELECT count(*) FROM pg_proc WHERE proname LIKE 'http%' AND pronamespace = 'public'::regnamespace;")
if [[ "$HTTP_FN" -gt 0 ]]; then ok "http functions registered ($HTTP_FN)"; else fail "http functions not found"; fi

# ── test: pg_net ────────────────────────────────────────────────
log "Testing pg_net"
psql_exec "CREATE EXTENSION IF NOT EXISTS pg_net;" >/dev/null && ok "CREATE EXTENSION pg_net" || fail "CREATE EXTENSION pg_net"

NET_FN=$(psql_exec "SELECT count(*) FROM pg_proc WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'net');")
if [[ "$NET_FN" -gt 0 ]]; then ok "net schema has $NET_FN functions"; else fail "net schema has no functions"; fi

# ── test: pg_repack ─────────────────────────────────────────────
log "Testing pg_repack"
psql_exec "CREATE EXTENSION IF NOT EXISTS pg_repack;" >/dev/null && ok "CREATE EXTENSION pg_repack" || fail "CREATE EXTENSION pg_repack"

REPACK_VER=$(psql_exec "SELECT extversion FROM pg_extension WHERE extname = 'pg_repack';")
if [[ -n "$REPACK_VER" ]]; then ok "pg_repack version $REPACK_VER"; else fail "pg_repack not found in pg_extension"; fi

REPACK_CLI=$(docker exec "$CONTAINER" which pg_repack 2>/dev/null)
if [[ -n "$REPACK_CLI" ]]; then ok "pg_repack CLI at $REPACK_CLI"; else fail "pg_repack CLI not found"; fi

# ── test: pg_stat_statements (contrib) ──────────────────────────
log "Testing pg_stat_statements (contrib)"
AVAIL=$(psql_exec "SELECT count(*) FROM pg_available_extensions WHERE name = 'pg_stat_statements';")
if [[ "$AVAIL" == "1" ]]; then ok "pg_stat_statements available"; else fail "pg_stat_statements not available"; fi

# ── test: basic entrypoint compatibility ────────────────────────
log "Testing entrypoint compatibility"
EP=$(docker inspect --format='{{json .Config.Entrypoint}}' "$CONTAINER")
if echo "$EP" | grep -q 'docker-entrypoint.sh'; then ok "entrypoint is docker-entrypoint.sh"; else fail "unexpected entrypoint: $EP"; fi

# ── test: pgsodium/vault preload on a fresh PGDATA ──────────────
# Preloading pgsodium without pgsodium.getkey_script must still start: the image
# installs the getkey script at the default path. Runs as a non-root uid without
# a passwd entry, like an EFS access point (owner forced, chown not allowed).
log "Testing pgsodium/vault preload on fresh PGDATA (uid 1001, no getkey GUC)"
SODIUM="pg-sodium-test-$$"
SODIUM_VOL="pg-sodium-test-$$"
docker volume create "$SODIUM_VOL" >/dev/null
docker run "${PLATFORM_ARGS[@]}" --rm -v "$SODIUM_VOL:/v" --entrypoint chown "$IMAGE" 1001:1001 /v
trap 'cleanup; docker rm -f "$SODIUM" &>/dev/null || true; docker volume rm -f "$SODIUM_VOL" &>/dev/null || true' EXIT
docker run "${PLATFORM_ARGS[@]}" -d --name "$SODIUM" --user 1001:1001 \
  -e POSTGRES_PASSWORD=test \
  -v "$SODIUM_VOL:/var/lib/postgresql" \
  "$IMAGE" \
  postgres -c shared_preload_libraries=pgsodium,supabase_vault \
  >/dev/null
sodium_ready() {
  for _ in $(seq 1 30); do
    docker exec "$SODIUM" pg_isready -h 127.0.0.1 -U postgres -q &>/dev/null && return 0
    sleep 1
  done
  return 1
}
sodium_sql() { docker exec -i "$SODIUM" psql -U postgres -qAt -v ON_ERROR_STOP=1 "$@" 2>&1; }
sodium_key_hash() { docker exec "$SODIUM" sh -c 'sha256sum "$PGDATA/pgsodium_root.key" | cut -c1-16'; }

if sodium_ready; then
  ok "fresh PGDATA starts with pgsodium preloaded"
  KEY_MODE=$(docker exec "$SODIUM" sh -c 'stat -c "%a %u" "$PGDATA/pgsodium_root.key"')
  if [[ "$KEY_MODE" == "600 1001" ]]; then ok "root key is 0600, owned by 1001"; else fail "root key mode/owner: $KEY_MODE"; fi
  KEY_HASH=$(sodium_key_hash)
  printf '%s\n' "CREATE EXTENSION pgsodium;" "CREATE EXTENSION supabase_vault CASCADE;" \
    "SELECT vault.create_secret('probe-value', '_test_probe');" | sodium_sql >/tmp/pg-sodium-$$.out \
    && ok "vault.create_secret()" || { fail "vault.create_secret()"; sed 's/^/    /' /tmp/pg-sodium-$$.out; }
  rm -f /tmp/pg-sodium-$$.out
  docker restart "$SODIUM" >/dev/null
  if sodium_ready; then ok "restart with existing key"; else fail "restart with existing key"; fi
  if [[ "$(sodium_key_hash)" == "$KEY_HASH" ]]; then ok "root key unchanged after restart"; else fail "root key changed after restart"; fi
  DEC=$(sodium_sql -c "SELECT decrypted_secret = 'probe-value' FROM vault.decrypted_secrets WHERE name = '_test_probe';" || true)
  if [[ "$DEC" == "t" ]]; then ok "vault secret decrypts after restart"; else fail "vault decrypt after restart: $DEC"; fi
else
  fail "fresh PGDATA with pgsodium preloaded did not start"
  docker logs "$SODIUM" 2>&1 | tail -10
fi

# ── summary ─────────────────────────────────────────────────────
echo ""
log "Results: $PASS passed, $FAIL failed"
if [[ "$FAIL" -gt 0 ]]; then
  exit 1
fi
