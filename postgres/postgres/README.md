# wener/postgres

Drop-in replacement for the [official PostgreSQL Docker image](https://hub.docker.com/_/postgres) with additional
extensions pre-installed. Based on `postgres:18-alpine`.

```bash
docker pull wener/postgres:18
# or
docker pull quay.io/wener/postgres:18
```

## Included Extensions

### Core Extensions

| Extension                                                     | Version | Preload | Description                                    |
|---------------------------------------------------------------|---------|---------|------------------------------------------------|
| [pgvector](https://github.com/pgvector/pgvector)              | 0.8.2   | No      | Vector similarity search (ivfflat, hnsw)       |
| [timescaledb](https://github.com/timescale/timescaledb)       | 2.25.2  | Yes     | Time-series data, hypertables, compression     |
| [pg_cron](https://github.com/citusdata/pg_cron)               | 1.6.7   | Yes     | Cron-based job scheduler                       |
| [pg_partman](https://github.com/pgpartman/pg_partman)         | 5.4.3   | Yes (bgw) | Automated partition management               |
| [pgmq](https://github.com/pgmq/pgmq)                         | 1.11.0  | No      | Lightweight message queue (like SQS)           |
| [pg_tle](https://github.com/aws/pg_tle)                       | 1.5.2   | Yes     | Trusted Language Extensions framework          |

### Monitoring & Audit

| Extension                                                     | Version | Preload | Description                                    |
|---------------------------------------------------------------|---------|---------|------------------------------------------------|
| [pg_stat_monitor](https://github.com/percona/pg_stat_monitor) | 2.3.2   | Yes     | Query performance monitoring                   |
| [pgaudit](https://github.com/pgaudit/pgaudit)                 | 18.0    | Yes     | Session and object audit logging               |

### Networking & HTTP

| Extension                                                     | Version | Preload | Description                                    |
|---------------------------------------------------------------|---------|---------|------------------------------------------------|
| [http](https://github.com/pramsey/pgsql-http)                 | 1.7.0   | No      | HTTP client for PostgreSQL                     |
| [pg_net](https://github.com/supabase/pg_net)                  | 0.20.2  | Yes     | Async HTTP/HTTPS requests from SQL             |

### Foreign Data Wrappers (supabase/wrappers)

| FDW                | Handler                       | Description              |
|--------------------|-------------------------------|--------------------------|
| ClickHouse         | `click_house_fdw_handler`     | ClickHouse database      |
| MySQL              | `mysql_fdw_handler`           | MySQL/MariaDB            |
| Redis              | `redis_fdw_handler`           | Redis key-value store    |
| DuckDB             | `duckdb_fdw_handler`          | DuckDB analytics         |
| S3                 | `s3_fdw_handler`              | S3-compatible storage    |
| S3 Vectors         | `s3_vectors_fdw_handler`      | S3 vector storage        |
| Prometheus         | `prometheus_fdw_handler`      | Prometheus metrics       |
| Tencent CLS        | `tencent_cls_fdw_handler`     | Tencent Cloud Log        |

All FDWs are accessed via `CREATE EXTENSION wrappers;` then `CREATE FOREIGN DATA WRAPPER ... HANDLER <handler> VALIDATOR <validator>;`.

### Security & Utilities

| Extension                                                     | Version | Preload | Description                                    |
|---------------------------------------------------------------|---------|---------|------------------------------------------------|
| [pgsodium](https://github.com/michelp/pgsodium)               | 3.1.9   | Yes     | Encryption using libsodium                     |
| [vault](https://github.com/supabase/vault)                    | 0.3.1   | No      | Encrypted secrets storage (requires pgsodium)  |
| [pg_hashids](https://github.com/iCyberon/pg_hashids)          | 1.2.1   | No      | Short unique ID generation from integers       |
| [pg_repack](https://github.com/reorg/pg_repack)               | 1.5.3   | No      | Online table reorganization                    |

### Language & Scripting

| Extension                                                     | Version | Preload | Description                                    |
|---------------------------------------------------------------|---------|---------|------------------------------------------------|
| [pljs](https://github.com/pljs/pljs)                          | develop | No      | JavaScript for PostgreSQL via QuickJS          |
| [pg_wodekit](https://github.com/wenerme/pg_wodekit)           | develop | No      | Custom utility functions (pgrx)                |

### DuckDB Extensions

Pre-built DuckDB extensions for `linux_*_musl` (not available from official repos):

| Extension | Description                     |
|-----------|---------------------------------|
| httpfs    | HTTP/S3 file system for DuckDB  |

All standard contrib extensions (e.g. `pg_stat_statements`, `hstore`, `uuid-ossp`, `pgcrypto`) are also available from the base image.

## Quick Start

```bash
docker run --rm -e POSTGRES_PASSWORD=secret -p 5432:5432 wener/postgres:18 \
  postgres \
    -c shared_preload_libraries=timescaledb,pg_cron,pg_tle,pg_net,pgaudit,pg_stat_monitor,pg_partman_bgw \
    -c cron.database_name=postgres
```

Then create extensions:

```sql
CREATE EXTENSION vector;
CREATE EXTENSION timescaledb;
CREATE EXTENSION pg_cron;
CREATE EXTENSION pg_partman;
CREATE EXTENSION pgmq;
CREATE EXTENSION wrappers;
-- ...
```

## Docker Compose

```yaml
services:
  db:
    image: wener/postgres:18
    environment:
      POSTGRES_PASSWORD: secret
    command:
      - postgres
      - -c
      - shared_preload_libraries=timescaledb,pg_cron,pg_tle,pg_net,pgaudit,pg_stat_monitor,pg_partman_bgw
      - -c
      - cron.database_name=postgres
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql
volumes:
  pgdata:
```

> **Note:** PG 18+ uses `PGDATA=/var/lib/postgresql/18/docker`. Mount at `/var/lib/postgresql` (not
> `/var/lib/postgresql/data`) to support `pg_upgrade --link`.

## Extension Notes

### timescaledb

Requires `shared_preload_libraries = 'timescaledb'`. Must be first in the list for best compatibility.

```sql
CREATE EXTENSION timescaledb;
CREATE TABLE metrics (
  time   timestamptz NOT NULL,
  device text,
  value  double precision
);
SELECT create_hypertable('metrics', by_range('time'));
```

### pgmq

Lightweight message queue with at-least-once delivery. Optional `pg_partman` integration for partition-based queue management.

```sql
CREATE EXTENSION pgmq;
SELECT pgmq.create('my_queue');
SELECT pgmq.send('my_queue', '{"key": "value"}'::jsonb);
SELECT * FROM pgmq.read('my_queue', 30, 1);
```

### pg_partman

Requires `shared_preload_libraries = 'pg_partman_bgw'` for background maintenance.

```sql
CREATE EXTENSION pg_partman;
SELECT partman.create_parent('public.events', 'created_at', 'native', 'daily');
```

### pgsodium & vault

The image installs a getkey script at the default path that both extensions look for
(`$sharedir/extension/pgsodium_getkey`), so `shared_preload_libraries=pgsodium,supabase_vault`
works on a fresh `PGDATA` without extra settings. On first start it writes a random
32-byte root key to `pgsodium_root.key` (mode 0600) in the data directory.

```sql
CREATE EXTENSION pgsodium;
CREATE EXTENSION supabase_vault;  -- requires pgsodium
```

- Keep `pgsodium_root.key` with the data directory and back it up with it; `pg_dump` does not
  include it. If it is lost or replaced, encrypted data cannot be decrypted.
- The script never regenerates an existing key. A corrupt key file stops the server instead.
- The data directory is taken from the postmaster's working directory, with `$PGDATA` as fallback.
- Images built before this change (e.g. `18.3`, `18.3-r1`) lack the default path. When preloading
  pgsodium on them, set it explicitly:
  `-c pgsodium.getkey_script=/usr/local/bin/pgsodium_getkey.sh` (and `vault.getkey_script` for vault).
- Running as a non-root uid (e.g. an EFS access point that forces the owner and forbids chown)
  works: the entrypoint skips chown and uses nss_wrapper for initdb.

### supabase wrappers

```sql
CREATE EXTENSION wrappers;
CREATE FOREIGN DATA WRAPPER clickhouse_wrapper
  HANDLER click_house_fdw_handler VALIDATOR click_house_fdw_validator;
CREATE SERVER clickhouse_svr FOREIGN DATA WRAPPER clickhouse_wrapper
  OPTIONS (conn_string 'tcp://default:@localhost:9000/default');
```

## Compatibility

This image preserves full compatibility with the official `postgres` Alpine image:

- Same entrypoint (`docker-entrypoint.sh`) and initialization flow
- `/docker-entrypoint-initdb.d/` scripts run at first start
- Same environment variables: `POSTGRES_PASSWORD`, `POSTGRES_USER`, `POSTGRES_DB`, `POSTGRES_INITDB_ARGS`
- Default data directory: `/var/lib/postgresql/18/docker`

## Build

```bash
# Load for current platform
make load:postgres

# Push multi-arch
make push:postgres

# Print build config
make print
```

Pin to a specific PostgreSQL version:

```bash
docker buildx bake --load \
  --set '*.platform=linux/arm64' \
  --set '*.args.PG_VERSION=18'
```
