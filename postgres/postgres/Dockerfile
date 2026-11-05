# syntax=docker/dockerfile:1

ARG PG_VERSION=18
ARG PG_IMAGE_VERSION=18.6
ARG PG_ALPINE_VERSION=3.24

# ── base build stage ────────────────────────────────────────────
FROM postgres:${PG_IMAGE_VERSION}-alpine${PG_ALPINE_VERSION} AS build

ARG PG_IMAGE_VERSION=18.6
ARG PG_ALPINE_VERSION=3.24
ARG TARGETARCH
ARG TARGETVARIANT

# samurai = ninjia-build
RUN --mount=type=cache,id=apk-pg-build-$PG_IMAGE_VERSION-alpine$PG_ALPINE_VERSION-$TARGETARCH$TARGETVARIANT,sharing=locked,target=/etc/apk/cache \
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
ARG WRAPPERS_REV=ecafbf1979af81a18bcb57d790bd167208d3ffa0
ARG PGRX_VERSION=0.19.2
# The wrappers workspace rust-version; Alpine's rust (1.96 on 3.24) lags behind it.
ARG RUST_VERSION=1.97.1
# Must equal the DuckDB bundled by the wrappers duckdb crate; checked against Cargo.lock below.
ARG DUCKDB_VERSION=v1.5.6
# Parallel rustc/cc jobs; libduckdb-sys compiles DuckDB C++ and runs out of memory with more.
ARG CARGO_BUILD_JOBS=2
# wrappers versions already installed in existing databases; their catalog still references
# $libdir/wrappers-<old>.so until `ALTER EXTENSION wrappers UPDATE`.
ARG WRAPPERS_OLD_VERSIONS="0.6.0"

# musl rustup toolchains link statically by default; pgrx extensions must not.
ENV RUSTUP_HOME=/opt/rustup CARGO_HOME=/root/.cargo PATH=/root/.cargo/bin:${PATH} \
    RUSTFLAGS="-C target-feature=-crt-static"
RUN --mount=type=cache,id=apk-pg-build-$TARGETARCH$TARGETVARIANT,sharing=locked,target=/etc/apk/cache \
    apk add rustup && \
    rustup-init -y --profile minimal --default-toolchain ${RUST_VERSION} --no-modify-path && \
    rustc --version

RUN --mount=type=cache,id=cargo-registry-wrappers-$TARGETARCH,target=/root/.cargo/registry \
    --mount=type=cache,id=cargo-git-wrappers-$TARGETARCH,target=/root/.cargo/git \
    cargo install --locked cargo-pgrx --version ${PGRX_VERSION}

RUN cargo pgrx init --pg${PG_VERSION}=$(which pg_config)

# Fetch the exact commit so WRAPPERS_REV pins the source, not just the cache.
RUN set -eux; \
    git init -q /tmp/wrappers; \
    cd /tmp/wrappers; \
    git fetch -q --depth 1 ${WRAPPERS_REPO} ${WRAPPERS_REV}; \
    git checkout -q FETCH_HEAD; \
    test "$(git rev-parse HEAD)" = "${WRAPPERS_REV}"; \
    grep -q "pgrx = { version = \"=${PGRX_VERSION}\"" wrappers/Cargo.toml \
      || { echo "wrappers pins another pgrx; set PGRX_VERSION" >&2; grep -n 'pgrx = ' wrappers/Cargo.toml >&2; exit 1; }; \
    duckdb_crate=$(awk '/^name = "libduckdb-sys"$/{getline; gsub(/[^0-9.]/, ""); print; exit}' Cargo.lock); \
    minor=$(echo "$duckdb_crate" | cut -d. -f2); \
    bundled="v$((minor / 10000)).$((minor / 100 % 100)).$((minor % 100))"; \
    test "$bundled" = "${DUCKDB_VERSION}" \
      || { echo "wrappers bundles DuckDB $bundled (libduckdb-sys $duckdb_crate), DUCKDB_VERSION=${DUCKDB_VERSION}" >&2; exit 1; }

RUN --mount=type=cache,id=cargo-registry-wrappers-$TARGETARCH,target=/root/.cargo/registry \
    --mount=type=cache,id=cargo-git-wrappers-$TARGETARCH,target=/root/.cargo/git \
    --mount=type=cache,id=cargo-target-wrappers-$TARGETARCH,target=/tmp/wrappers/target \
    cd /tmp/wrappers/wrappers && \
    cargo pgrx install --release --no-default-features \
        --features "pg${PG_VERSION},mysql_fdw,redis_fdw,clickhouse_fdw,s3_fdw,s3vectors_fdw,tencent_cls_fdw,duckdb_fdw,prometheus_fdw" \
        --pg-config $(which pg_config) && \
    mkdir -p /tmp/install/usr/local/lib/postgresql \
             /tmp/install/usr/local/share/postgresql/extension && \
    cp /usr/local/lib/postgresql/wrappers*.so /tmp/install/usr/local/lib/postgresql/ && \
    cp /usr/local/share/postgresql/extension/wrappers* /tmp/install/usr/local/share/postgresql/extension/

# Keep existing databases working across the version bump:
#  - wrappers-<old>.so -> wrappers-<new>.so keeps not-yet-updated catalogs loadable
#  - wrappers--<old>--<new>.sql makes `ALTER EXTENSION wrappers UPDATE` possible
RUN set -eux; \
    cd /tmp/install/usr/local/share/postgresql/extension; \
    set -- wrappers--*.sql; \
    test $# -eq 1 && test -e "$1"; \
    new=$(echo "$1" | sed -E 's/^wrappers--([^-]+)\.sql$/\1/'); \
    test -e /tmp/install/usr/local/lib/postgresql/wrappers-$new.so; \
    for v in ${WRAPPERS_OLD_VERSIONS}; do \
      [ "$v" = "$new" ] && continue; \
      cp wrappers--$new.sql wrappers--$v--$new.sql; \
      ln -sf wrappers-$new.so /tmp/install/usr/local/lib/postgresql/wrappers-$v.so; \
    done; \
    ls -la . /tmp/install/usr/local/lib/postgresql/

# ── DuckDB extensions (pre-built not available for linux_*_musl)
FROM build AS duckdb_ext

ARG TARGETARCH
ARG TARGETVARIANT
ARG DUCKDB_VERSION=v1.5.6

RUN git clone --branch ${DUCKDB_VERSION} --depth 1 \
        https://github.com/duckdb/duckdb.git /tmp/duckdb

# DuckDB's own config pins the httpfs commit and patches that match this release.
RUN --mount=type=cache,id=ccache-duckdb-$TARGETARCH,target=/root/.ccache \
    set -eux; \
    cd /tmp/duckdb; \
    EXTENSION_CONFIGS="/tmp/duckdb/.github/config/extensions/httpfs.cmake" make -j1 release; \
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
ARG PGVECTOR_VERSION=0.8.7

RUN git clone --branch v${PGVECTOR_VERSION} --depth 1 \
        https://github.com/pgvector/pgvector.git /tmp/pgvector

RUN --mount=type=cache,id=ccache-pgext-$TARGETARCH,target=/root/.ccache \
    cd /tmp/pgvector; \
    make USE_PGXS=1 with_llvm=no; \
    make USE_PGXS=1 with_llvm=no install DESTDIR=/tmp/install

# ── pg_cron ─────────────────────────────────────────────────────
FROM build AS pg_cron

ARG TARGETARCH
ARG PG_CRON_VERSION=1.6.8

RUN git clone --branch v${PG_CRON_VERSION} --depth 1 \
        https://github.com/citusdata/pg_cron.git /tmp/pg_cron

RUN --mount=type=cache,id=ccache-pgext-$TARGETARCH,target=/root/.ccache \
    cd /tmp/pg_cron; \
    make USE_PGXS=1 with_llvm=no; \
    make USE_PGXS=1 with_llvm=no install DESTDIR=/tmp/install

# ── pg_tle ──────────────────────────────────────────────────────
FROM build AS pg_tle

ARG TARGETARCH
ARG PG_TLE_VERSION=1.5.3

RUN git clone --branch v${PG_TLE_VERSION} --depth 1 \
        https://github.com/aws/pg_tle.git /tmp/pg_tle

RUN --mount=type=cache,id=ccache-pgext-$TARGETARCH,target=/root/.ccache \
    cd /tmp/pg_tle; \
    make USE_PGXS=1 FLEX=flex with_llvm=no; \
    make USE_PGXS=1 FLEX=flex with_llvm=no install DESTDIR=/tmp/install

# ── pg_stat_monitor ─────────────────────────────────────────────
FROM build AS pg_stat_monitor

ARG TARGETARCH
ARG PG_STAT_MONITOR_VERSION=2.4.0

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
ARG PGSQL_HTTP_VERSION=1.7.2

RUN git clone --branch v${PGSQL_HTTP_VERSION} --depth 1 \
        https://github.com/pramsey/pgsql-http.git /tmp/pgsql-http

RUN --mount=type=cache,id=ccache-pgext-$TARGETARCH,target=/root/.ccache \
    cd /tmp/pgsql-http; \
    make USE_PGXS=1 with_llvm=no; \
    make USE_PGXS=1 with_llvm=no install DESTDIR=/tmp/install

# ── pg_net ──────────────────────────────────────────────────────
FROM build AS pg_net

ARG TARGETARCH
ARG PG_NET_VERSION=0.20.5

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
ARG PG_PARTMAN_VERSION=5.5.0

RUN git clone --branch v${PG_PARTMAN_VERSION} --depth 1 \
        https://github.com/pgpartman/pg_partman.git /tmp/pg_partman

RUN --mount=type=cache,id=ccache-pgext-$TARGETARCH,target=/root/.ccache \
    cd /tmp/pg_partman; \
    make USE_PGXS=1 with_llvm=no; \
    make USE_PGXS=1 with_llvm=no install DESTDIR=/tmp/install

# ── pgmq ──────────────────────────────────────────────────────
FROM build AS pgmq

ARG TARGETARCH
ARG PGMQ_VERSION=1.13.1

RUN git clone --branch v${PGMQ_VERSION} --depth 1 \
        https://github.com/pgmq/pgmq.git /tmp/pgmq

RUN cd /tmp/pgmq/pgmq-extension; \
    make USE_PGXS=1; \
    make USE_PGXS=1 install DESTDIR=/tmp/install

# ── timescaledb ──────────────────────────────────────────────
FROM build AS timescaledb

ARG TARGETARCH
ARG TARGETVARIANT
ARG TIMESCALEDB_VERSION=2.31.0

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
ARG PLJS_REV=d59634ed2fe98d6342956a79af5be0874d811a5f

RUN set -eux; \
    git init -q /tmp/pljs; \
    cd /tmp/pljs; \
    git fetch -q --depth 1 ${PLJS_REPO} ${PLJS_REV}; \
    git checkout -q FETCH_HEAD; \
    test "$(git rev-parse HEAD)" = "${PLJS_REV}"; \
    git submodule update -q --init --recursive --depth 1

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
ARG PG_WODEKIT_REV=65fbc46b79dbce692a7ec8bbeb2f2ae5016cc4b4
ARG PGRX_VERSION=0.19.2

RUN --mount=type=cache,id=cargo-registry-pg-wodekit-$TARGETARCH,target=/root/.cargo/registry \
    --mount=type=cache,id=cargo-git-pg-wodekit-$TARGETARCH,target=/root/.cargo/git \
    cargo install --locked cargo-pgrx --version ${PGRX_VERSION}

RUN cargo pgrx init --pg${PG_VERSION}=$(which pg_config)

RUN set -eux; \
    git init -q /tmp/pg_wodekit; \
    cd /tmp/pg_wodekit; \
    git fetch -q --depth 1 ${PG_WODEKIT_REPO} ${PG_WODEKIT_REV}; \
    git checkout -q FETCH_HEAD; \
    test "$(git rev-parse HEAD)" = "${PG_WODEKIT_REV}"

RUN set -eux; \
    cd /tmp/pg_wodekit; \
    sed -i \
      -e "s/pgrx = \"0\\.16\\.1\"/pgrx = \"${PGRX_VERSION}\"/g" \
      -e "s/pgrx-tests = \"0\\.16\\.1\"/pgrx-tests = \"${PGRX_VERSION}\"/g" \
      Cargo.toml; \
    cargo update -p pgrx --precise ${PGRX_VERSION}; \
    cargo update -p pgrx-tests --precise ${PGRX_VERSION}

RUN --mount=type=cache,id=cargo-registry-pg-wodekit-$TARGETARCH,target=/root/.cargo/registry \
    --mount=type=cache,id=cargo-git-pg-wodekit-$TARGETARCH,target=/root/.cargo/git \
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
ARG PGSODIUM_VERSION=3.1.11

RUN git clone --branch v${PGSODIUM_VERSION} --depth 1 \
        https://github.com/michelp/pgsodium.git /tmp/pgsodium

RUN --mount=type=cache,id=ccache-pgext-$TARGETARCH,target=/root/.ccache \
    cd /tmp/pgsodium; \
    make USE_PGXS=1 with_llvm=no; \
    make USE_PGXS=1 with_llvm=no install DESTDIR=/tmp/install

# ── supabase vault ─────────────────────────────────────────────
FROM build AS vault

ARG TARGETARCH
ARG VAULT_VERSION=0.3.2

# Vault needs pgsodium headers at build time
COPY --from=pgsodium /tmp/install/usr/local/ /usr/local/

RUN git clone --branch v${VAULT_VERSION} --depth 1 \
        https://github.com/supabase/vault.git /tmp/vault

RUN --mount=type=cache,id=ccache-pgext-$TARGETARCH,target=/root/.ccache \
    cd /tmp/vault; \
    make USE_PGXS=1 with_llvm=no; \
    make USE_PGXS=1 with_llvm=no install DESTDIR=/tmp/install

# ── final image ─────────────────────────────────────────────────
FROM postgres:${PG_IMAGE_VERSION}-alpine${PG_ALPINE_VERSION}

ARG TARGETARCH
ARG TARGETVARIANT

RUN apk add libsodium

# pgsodium / supabase_vault getkey script — generates the root key on first run.
# Both extensions default to $sharedir/extension/pgsodium_getkey when
# pgsodium.getkey_script / vault.getkey_script are not set, and they check it while
# loading shared_preload_libraries, before any /docker-entrypoint-initdb.d script
# runs. Installing it at the default path lets a fresh PGDATA start with only
# shared_preload_libraries=pgsodium; the explicit GUC still works for old setups.
COPY --chmod=755 pgsodium_getkey.sh /usr/local/bin/pgsodium_getkey.sh
RUN mkdir -p /usr/local/share/postgresql/extension && \
    ln -sf /usr/local/bin/pgsodium_getkey.sh /usr/local/share/postgresql/extension/pgsodium_getkey

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

# pgsodium/vault explicit config — appended on first initdb run, so the conf keeps
# working if the default path ever changes. It cannot help the very first start
# when pgsodium is preloaded (the temp server loads it before initdb.d runs);
# the default-path symlink above covers that case.
RUN printf '#!/bin/sh\necho "pgsodium.getkey_script = '"'"'/usr/local/bin/pgsodium_getkey.sh'"'"'" >> "$PGDATA/postgresql.conf"\necho "vault.getkey_script = '"'"'/usr/local/bin/pgsodium_getkey.sh'"'"'" >> "$PGDATA/postgresql.conf"\n' \
    > /docker-entrypoint-initdb.d/00-pgsodium.sh && chmod +x /docker-entrypoint-initdb.d/00-pgsodium.sh
