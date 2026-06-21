ARG ALPINE_RELEASE=3.24.1
FROM wener/base:${ALPINE_RELEASE}

ARG TARGETARCH
ARG TARGETVARIANT
ARG VERSION=24.17.0
ARG NPM_VERSION=11.17.0
ARG PNPM_VERSION=11.8.0
ARG YARN_VERSION=1.22.22
ARG BIOME_VERSION=2.5.0
ARG BUN_VERSION=1.3.14
ARG FULL_ICU_VERSION=1.6.0
ARG NODE_DOWNLOAD_BASE=https://unofficial-builds.nodejs.org/download/release

ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
    NODE_ICU_DATA=/usr/local/lib/node_modules/full-icu \
    npm_config_fund=false \
    npm_config_audit=false \
    npm_config_update_notifier=false \
    npm_config_registry=https://registry.npmmirror.com

RUN --mount=type=cache,id=apk-${TARGETARCH}${TARGETVARIANT},sharing=locked,target=/etc/apk/cache \
    set -eux; \
    apk add --no-cache \
      bash \
      build-base \
      ca-certificates \
      curl \
      file \
      git \
      gcompat \
      jq \
      gzip \
      just \
      libstdc++ \
      make \
      openssh-client \
      pkgconf \
      python3 \
      rsync \
      tar \
      unzip \
      xz; \
    mkdir -p /workspace

RUN set -eux; \
    case "${TARGETARCH}" in \
      amd64) node_arch="x64" ;; \
      arm64) node_arch="arm64" ;; \
      *) echo "unsupported TARGETARCH=${TARGETARCH}" >&2; exit 1 ;; \
    esac; \
    curl -fsSLo /tmp/node.tar.xz "${NODE_DOWNLOAD_BASE}/v${VERSION}/node-v${VERSION}-linux-${node_arch}-musl.tar.xz"; \
    tar -xJf /tmp/node.tar.xz -C /usr/local --strip-components=1 --no-same-owner; \
    rm -f /tmp/node.tar.xz; \
    ln -sf /usr/local/bin/node /usr/local/bin/nodejs

RUN --mount=type=cache,target=/root/.npm \
    set -eux; \
    npm install -g \
      "npm@${NPM_VERSION}" \
      "pnpm@${PNPM_VERSION}" \
      "yarn@${YARN_VERSION}" \
      "@biomejs/biome@${BIOME_VERSION}" \
      "bun@${BUN_VERSION}" \
      "full-icu@${FULL_ICU_VERSION}"

WORKDIR /workspace

RUN set -eux; \
    node --version; \
    npm --version; \
    pnpm --version; \
    yarn --version; \
    bun --version; \
    biome --version; \
    node -e 'const expected="zh-CN"; const actual=new Intl.DateTimeFormat(expected,{month:"long"}).resolvedOptions().locale; if (actual !== expected) throw new Error(`full ICU unavailable: ${actual}`); console.log(`icu ${process.versions.icu} ${actual}`)'; \
    git --version; \
    make --version | head -1; \
    just --version; \
    jq --version; \
    python3 --version; \
    curl --version | head -1; \
    ssh -V; \
    rsync --version | head -1

CMD ["node", "--version"]
