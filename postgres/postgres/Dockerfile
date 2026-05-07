# syntax=docker/dockerfile:1

ARG PG_VERSION=18

# ── base build stage ────────────────────────────────────────────
FROM postgres:${PG_VERSION}-alpine AS build

ARG TARGETARCH
ARG TARGETVARIANT

# samurai = ninjia-build
RUN --mount=type=cache,id=apk-pg-build-$TARGETARCH$TARGETVARIANT,sharing=locked,target=/etc/apk/cache \
    apk add \
			build-base clang-dev cmake flex g++ git samurai ccache \
			curl-dev libcurl \
			krb5-dev krb5-libs \
			libsodium libsodium-dev \
			lz4-dev zlib-dev \
			openssl-dev \
			postgresql-dev \
			python3 \
			rust cargo rustfmt

# Use ccache for all C/C++ builds
ENV PATH="/usr/lib/ccache/bin:${PATH}"

# ── supabase wrappers ─────────────────────────────────────────
FROM build AS wrappers

ARG PG_VERSION=18
ARG TARGETARCH
ARG TARGETVARIANT
ARG WRAPPERS_REPO=https://github.com/wenerme/wrappers.git
ARG WRAPPERS_BRANCH=develop
ARG WRAPPERS_REV=ddf5a2d6850ec47fcee2a1a9b1c1582e5eb1141a

RUN --mount=type=cache,id=cargo-registry-$TARGETARCH,target=/root/.cargo/registry \
    --mount=type=cache,id=cargo-git-$TARGETARCH,target=/root/.cargo/git \
    cargo install --locked cargo-pgrx --version 0.16.1

RUN cargo pgrx init --pg${PG_VERSION}=$(which pg_config)

RUN echo "rev: ${WRAPPERS_REV}" && git clone --branch ${WRAPPERS_BRANCH} --depth 1 ${WRAPPERS_REPO} /tmp/wrappers

RUN --mount=type=cache,id=cargo-registry-$TARGETARCH,target=/root/.cargo/registry \
    --mount=type=cache,id=cargo-git-$TARGETARCH,target=/root/.cargo/git \
    --mount=type=cache,id=cargo-target-wrappers-$TARGETARCH,target=/tmp/wrappers/target \
    cd /tmp/wrappers/wrappers && \
    cargo pgrx install --release --no-default-features \
        --features "pg${PG_VERSION},mysql_fdw,redis_fdw,clickhouse_fdw,s3_fdw,s3vectors_fdw,tencent_cls_fdw,duckdb_fdw,prometheus_fdw" \
        --pg-config $(which pg_config) && \
    mkdir -p /tmp/install/usr/local/lib/postgresql \
             /tmp/install/usr/local/share/postgresql/extension && \
    cp /usr/local/lib/postgresql/wrappers*.so /tmp/install/usr/local/lib/postgresql/ && \
    cp /usr/local/share/postgresql/extension/wrappers* /tmp/install/usr/local/share/postgresql/extension/

# ── DuckDB extensions (pre-built not available for linux_*_musl)
FROM build AS duckdb_ext

ARG TARGETARCH
ARG TARGETVARIANT
ARG DUCKDB_VERSION=v1.4.4

RUN git clone --branch ${DUCKDB_VERSION} --depth 1 \
        https://github.com/duckdb/duckdb.git /tmp/duckdb

RUN printf '%s\n' \
      'duckdb_extension_load(httpfs GIT_URL https://github.com/duckdb/duckdb-httpfs GIT_TAG 13f8a814d41a978c3f19eb1dc76069489652ea6f INCLUDE_DIR src/include)' \
      > /tmp/duckdb_ext_config.cmake

RUN --mount=type=cache,id=ccache-duckdb-$TARGETARCH,target=/root/.ccache \
    set -eux; \
    cd /tmp/duckdb; \
    EXTENSION_CONFIGS="/tmp/duckdb_ext_config.cmake" make release; \
    DUCKDB_VER=${DUCKDB_VERSION#v}; \
    PLATFORM="linux_${TARGETARCH}_musl"; \
    mkdir -p /tmp/install/duckdb-extensions/v${DUCKDB_VER}/${PLATFORM}; \
    for ext in httpfs; do \
        cp build/release/extension/${ext}/${ext}.duckdb_extension \
           /tmp/install/duckdb-extensions/v${DUCKDB_VER}/${PLATFORM}/; \
    done

# ── pgvector ────────────────────────────────────────────────────
FROM build AS pgvector

ARG TARGETARCH
ARG PGVECTOR_VERSION=0.8.2

RUN git clone --branch v${PGVECTOR_VERSION} --depth 1 \
        https://github.com/pgvector/pgvector.git /tmp/pgvector

RUN --mount=type=cache,id=ccache-pgext-$TARGETARCH,target=/root/.ccache \
    cd /tmp/pgvector; \
    make USE_PGXS=1 with_llvm=no; \
    make USE_PGXS=1 with_llvm=no install DESTDIR=/tmp/install

# ── pg_cron ─────────────────────────────────────────────────────
FROM build AS pg_cron

ARG TARGETARCH
ARG PG_CRON_VERSION=1.6.7

RUN git clone --branch v${PG_CRON_VERSION} --depth 1 \
        https://github.com/citusdata/pg_cron.git /tmp/pg_cron

RUN --mount=type=cache,id=ccache-pgext-$TARGETARCH,target=/root/.ccache \
    cd /tmp/pg_cron; \
    make USE_PGXS=1 with_llvm=no; \
    make USE_PGXS=1 with_llvm=no install DESTDIR=/tmp/install

# ── pg_tle ──────────────────────────────────────────────────────
FROM build AS pg_tle

ARG TARGETARCH
ARG PG_TLE_VERSION=1.5.2

RUN git clone --branch v${PG_TLE_VERSION} --depth 1 \
        https://github.com/aws/pg_tle.git /tmp/pg_tle

RUN --mount=type=cache,id=ccache-pgext-$TARGETARCH,target=/root/.ccache \
    cd /tmp/pg_tle; \
    make USE_PGXS=1 FLEX=flex with_llvm=no; \
    make USE_PGXS=1 FLEX=flex with_llvm=no install DESTDIR=/tmp/install

# ── pg_stat_monitor ─────────────────────────────────────────────
FROM build AS pg_stat_monitor

ARG TARGETARCH
ARG PG_STAT_MONITOR_VERSION=2.3.2

RUN git clone --branch ${PG_STAT_MONITOR_VERSION} --depth 1 \
        https://github.com/percona/pg_stat_monitor.git /tmp/pg_stat_monitor

RUN --mount=type=cache,id=ccache-pgext-$TARGETARCH,target=/root/.ccache \
    cd /tmp/pg_stat_monitor; \
    make USE_PGXS=1 with_llvm=no; \
    make USE_PGXS=1 with_llvm=no install DESTDIR=/tmp/install

# ── pgaudit ─────────────────────────────────────────────────────
FROM build AS pgaudit

ARG TARGETARCH
ARG PGAUDIT_VERSION=18.0

RUN git clone --branch ${PGAUDIT_VERSION} --depth 1 \
        https://github.com/pgaudit/pgaudit.git /tmp/pgaudit

RUN --mount=type=cache,id=ccache-pgext-$TARGETARCH,target=/root/.ccache \
    cd /tmp/pgaudit; \
    make USE_PGXS=1 with_llvm=no; \
    make USE_PGXS=1 with_llvm=no install DESTDIR=/tmp/install

# ── pg_hashids ──────────────────────────────────────────────────
FROM build AS pg_hashids

ARG TARGETARCH
ARG PG_HASHIDS_VERSION=1.2.1

RUN git clone --branch v${PG_HASHIDS_VERSION} --depth 1 \
        https://github.com/iCyberon/pg_hashids.git /tmp/pg_hashids

RUN --mount=type=cache,id=ccache-pgext-$TARGETARCH,target=/root/.ccache \
    cd /tmp/pg_hashids; \
    make USE_PGXS=1 with_llvm=no; \
    make USE_PGXS=1 with_llvm=no install DESTDIR=/tmp/install

# ── pgsql-http ──────────────────────────────────────────────────
FROM build AS pgsql_http

ARG TARGETARCH
ARG PGSQL_HTTP_VERSION=1.7.0

RUN git clone --branch v${PGSQL_HTTP_VERSION} --depth 1 \
        https://github.com/pramsey/pgsql-http.git /tmp/pgsql-http

RUN --mount=type=cache,id=ccache-pgext-$TARGETARCH,target=/root/.ccache \
    cd /tmp/pgsql-http; \
    make USE_PGXS=1 with_llvm=no; \
    make USE_PGXS=1 with_llvm=no install DESTDIR=/tmp/install

# ── pg_net ──────────────────────────────────────────────────────
FROM build AS pg_net

ARG TARGETARCH
ARG PG_NET_VERSION=0.20.2

RUN git clone --branch v${PG_NET_VERSION} --depth 1 \
        https://github.com/supabase/pg_net.git /tmp/pg_net

RUN --mount=type=cache,id=ccache-pgext-$TARGETARCH,target=/root/.ccache \
    cd /tmp/pg_net; \
    make USE_PGXS=1 with_llvm=no; \
    make USE_PGXS=1 with_llvm=no install DESTDIR=/tmp/install

# ── pg_repack ───────────────────────────────────────────────────
FROM build AS pg_repack

ARG TARGETARCH
ARG PG_REPACK_VERSION=1.5.3

RUN git clone --branch ver_${PG_REPACK_VERSION} --depth 1 \
        https://github.com/reorg/pg_repack.git /tmp/pg_repack

RUN --mount=type=cache,id=ccache-pgext-$TARGETARCH,target=/root/.ccache \
    cd /tmp/pg_repack; \
    make with_llvm=no; \
    make with_llvm=no install DESTDIR=/tmp/install

# ── pg_partman ─────────────────────────────────────────────────
FROM build AS pg_partman

ARG TARGETARCH
ARG PG_PARTMAN_VERSION=5.4.3

RUN git clone --branch v${PG_PARTMAN_VERSION} --depth 1 \
        https://github.com/pgpartman/pg_partman.git /tmp/pg_partman

RUN --mount=type=cache,id=ccache-pgext-$TARGETARCH,target=/root/.ccache \
    cd /tmp/pg_partman; \
    make USE_PGXS=1 with_llvm=no; \
    make USE_PGXS=1 with_llvm=no install DESTDIR=/tmp/install

# ── pgmq ──────────────────────────────────────────────────────
FROM build AS pgmq

ARG TARGETARCH
ARG PGMQ_VERSION=1.11.0

RUN git clone --branch v${PGMQ_VERSION} --depth 1 \
        https://github.com/pgmq/pgmq.git /tmp/pgmq

RUN cd /tmp/pgmq/pgmq-extension; \
    make USE_PGXS=1; \
    make USE_PGXS=1 install DESTDIR=/tmp/install

# ── timescaledb ──────────────────────────────────────────────
FROM build AS timescaledb

ARG TARGETARCH
ARG TARGETVARIANT
ARG TIMESCALEDB_VERSION=2.25.2

RUN --mount=type=cache,id=apk-pg-build-$TARGETARCH$TARGETVARIANT,sharing=locked,target=/etc/apk/cache \
    apk add dpkg-dev dpkg icu-dev

RUN git clone --branch ${TIMESCALEDB_VERSION} --depth 1 \
        https://github.com/timescale/timescaledb.git /tmp/timescaledb

RUN --mount=type=cache,id=ccache-pgext-$TARGETARCH,target=/root/.ccache \
    cd /tmp/timescaledb; \
    ./bootstrap \
        -DCMAKE_BUILD_TYPE=RelWithDebInfo \
        -DREGRESS_CHECKS=OFF \
        -DTAP_CHECKS=OFF \
        -DWARNINGS_AS_ERRORS=OFF \
        -DPROJECT_INSTALL_METHOD="docker"; \
    cd build && make install DESTDIR=/tmp/install

# ── pljs (JavaScript for PostgreSQL via QuickJS) ─────────────────
FROM build AS pljs

ARG TARGETARCH
ARG PLJS_REPO=https://github.com/wenerme/pljs.git
ARG PLJS_BRANCH=develop
ARG PLJS_REV=

RUN echo "rev: ${PLJS_REV}" && \
    git clone --branch ${PLJS_BRANCH} --depth 1 --recurse-submodules \
        ${PLJS_REPO} /tmp/pljs

RUN --mount=type=cache,id=ccache-pgext-$TARGETARCH,target=/root/.ccache \
    cd /tmp/pljs; \
    sed -i '/^CFLAGS/s/$/ -fPIC/' deps/quickjs/Makefile; \
    make USE_PGXS=1 with_llvm=no; \
    make USE_PGXS=1 with_llvm=no install DESTDIR=/tmp/install

# ── pg_wodekit ─────────────────────────────────────────────────
FROM build AS pg_wodekit

ARG PG_VERSION=18
ARG TARGETARCH
ARG TARGETVARIANT
ARG PG_WODEKIT_REPO=https://github.com/wenerme/pg_wodekit.git
ARG PG_WODEKIT_BRANCH=develop
ARG PG_WODEKIT_REV=65fbc46b79dbce692a7ec8bbeb2f2ae5016cc4b4

RUN --mount=type=cache,id=cargo-registry-$TARGETARCH,target=/root/.cargo/registry \
    --mount=type=cache,id=cargo-git-$TARGETARCH,target=/root/.cargo/git \
    cargo install --locked cargo-pgrx --version 0.16.1

RUN cargo pgrx init --pg${PG_VERSION}=$(which pg_config)

RUN echo "rev: ${PG_WODEKIT_REV}" && \
    git clone --branch ${PG_WODEKIT_BRANCH} --depth 1 \
        ${PG_WODEKIT_REPO} /tmp/pg_wodekit

RUN --mount=type=cache,id=cargo-registry-$TARGETARCH,target=/root/.cargo/registry \
    --mount=type=cache,id=cargo-git-$TARGETARCH,target=/root/.cargo/git \
    --mount=type=cache,id=cargo-target-pg_wodekit-$TARGETARCH,target=/tmp/pg_wodekit/target \
    cd /tmp/pg_wodekit && \
    cargo pgrx install --release --no-default-features \
        --features "pg${PG_VERSION}" \
        --pg-config $(which pg_config) && \
    mkdir -p /tmp/install/usr/local/lib/postgresql \
             /tmp/install/usr/local/share/postgresql/extension && \
    cp /usr/local/lib/postgresql/pg_wodekit*.so /tmp/install/usr/local/lib/postgresql/ && \
    cp /usr/local/share/postgresql/extension/pg_wodekit* /tmp/install/usr/local/share/postgresql/extension/

# ── pgsodium ───────────────────────────────────────────────────
FROM build AS pgsodium

ARG TARGETARCH
ARG PGSODIUM_VERSION=3.1.9

RUN git clone --branch v${PGSODIUM_VERSION} --depth 1 \
        https://github.com/michelp/pgsodium.git /tmp/pgsodium

RUN --mount=type=cache,id=ccache-pgext-$TARGETARCH,target=/root/.ccache \
    cd /tmp/pgsodium; \
    make USE_PGXS=1 with_llvm=no; \
    make USE_PGXS=1 with_llvm=no install DESTDIR=/tmp/install

# ── supabase vault ─────────────────────────────────────────────
FROM build AS vault

ARG TARGETARCH
ARG VAULT_VERSION=0.3.1

# Vault needs pgsodium headers at build time
COPY --from=pgsodium /tmp/install/usr/local/ /usr/local/

RUN git clone --branch v${VAULT_VERSION} --depth 1 \
        https://github.com/supabase/vault.git /tmp/vault

RUN --mount=type=cache,id=ccache-pgext-$TARGETARCH,target=/root/.ccache \
    cd /tmp/vault; \
    make USE_PGXS=1 with_llvm=no; \
    make USE_PGXS=1 with_llvm=no install DESTDIR=/tmp/install

# ── final image ─────────────────────────────────────────────────
FROM postgres:${PG_VERSION}-alpine

ARG TARGETARCH
ARG TARGETVARIANT

RUN apk add libsodium

# pgsodium getkey script — auto-generates root key on first run
RUN printf '#!/bin/sh\nset -eu\nKEY_FILE="${PGDATA}/pgsodium_root.key"\nif [ ! -f "$KEY_FILE" ]; then\n  head -c 32 /dev/urandom | od -A n -t x1 | tr -d " \\n" > "$KEY_FILE"\n  chmod 600 "$KEY_FILE"\nfi\ncat "$KEY_FILE"\n' \
    > /usr/local/bin/pgsodium_getkey.sh && chmod +x /usr/local/bin/pgsodium_getkey.sh

COPY --from=pgvector        /tmp/install/usr/local/ /usr/local/
COPY --from=pg_cron         /tmp/install/usr/local/ /usr/local/
COPY --from=pg_tle          /tmp/install/usr/local/ /usr/local/
COPY --from=pg_stat_monitor /tmp/install/usr/local/ /usr/local/
COPY --from=pgaudit         /tmp/install/usr/local/ /usr/local/
COPY --from=pg_hashids      /tmp/install/usr/local/ /usr/local/
COPY --from=pgsql_http      /tmp/install/usr/local/ /usr/local/
COPY --from=pg_net          /tmp/install/usr/local/ /usr/local/
COPY --from=pg_repack       /tmp/install/usr/local/ /usr/local/
COPY --from=pg_partman      /tmp/install/usr/local/ /usr/local/
COPY --from=pgmq            /tmp/install/usr/local/ /usr/local/
COPY --from=timescaledb     /tmp/install/usr/local/ /usr/local/
COPY --from=pljs            /tmp/install/usr/local/ /usr/local/
COPY --from=pgsodium        /tmp/install/usr/local/ /usr/local/
COPY --from=vault           /tmp/install/usr/local/ /usr/local/
COPY --from=pg_wodekit      /tmp/install/usr/local/ /usr/local/
COPY --from=duckdb_ext      /tmp/install/duckdb-extensions/ /usr/local/lib/duckdb/extensions/
COPY --from=wrappers 				/tmp/install/usr/local/ /usr/local/

# pgsodium/vault default config — appended on first initdb run
RUN printf '#!/bin/sh\necho "pgsodium.getkey_script = '"'"'/usr/local/bin/pgsodium_getkey.sh'"'"'" >> "$PGDATA/postgresql.conf"\necho "vault.getkey_script = '"'"'/usr/local/bin/pgsodium_getkey.sh'"'"'" >> "$PGDATA/postgresql.conf"\n' \
    > /docker-entrypoint-initdb.d/00-pgsodium.sh && chmod +x /docker-entrypoint-initdb.d/00-pgsodium.sh
