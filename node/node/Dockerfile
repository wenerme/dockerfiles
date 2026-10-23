ARG ALPINE_RELEASE=3.24.3
FROM wener/base:${ALPINE_RELEASE}

ARG TARGETARCH
ARG TARGETVARIANT
ARG VERSION=26.12.1
ARG PNPM_VERSION=11.28.7
ARG YARN_VERSION=1.22.22
ARG NODE_DOWNLOAD_BASE=https://unofficial-builds.nodejs.org/download/release

LABEL org.opencontainers.image.description="Node.js (official musl build) on Alpine with npm, pnpm and yarn"

ENV npm_config_fund=false \
    npm_config_update_notifier=false

# Official musl builds track upstream releases closely and ship full ICU; Alpine's nodejs packages lag behind.
# Headers are dropped: node-gyp downloads them when a native addon is built.
RUN --mount=type=cache,id=apk-${TARGETARCH}${TARGETVARIANT},sharing=locked,target=/etc/apk/cache \
    set -eux; \
    case "${TARGETARCH}" in \
      amd64) node_arch=x64 ;; \
      arm64) node_arch=arm64 ;; \
      *) echo "unsupported TARGETARCH=${TARGETARCH}" >&2; exit 1 ;; \
    esac; \
    apk add libstdc++ libgcc make; \
    apk add --virtual .fetch tar xz; \
    file="node-v${VERSION}-linux-${node_arch}-musl.tar.xz"; \
    cd /tmp; \
    curl -fsSLO "${NODE_DOWNLOAD_BASE}/v${VERSION}/${file}"; \
    curl -fsSL "${NODE_DOWNLOAD_BASE}/v${VERSION}/SHASUMS256.txt" | grep " ${file}\$" | sha256sum -c -; \
    tar -xJf "${file}" -C /usr/local --strip-components=1 --no-same-owner \
      --exclude='*/include' --exclude='*/CHANGELOG.md' --exclude='*/README.md' --exclude='*/LICENSE' \
      --exclude='*/share/doc' --exclude='*/share/man' --exclude='*/bin/corepack' --exclude='*/lib/node_modules/corepack'; \
    rm -f "${file}"; \
    apk del .fetch; \
    ln -sf /usr/local/bin/node /usr/local/bin/nodejs

RUN --mount=type=cache,target=/root/.npm \
    set -eux; \
    npm install -g "pnpm@${PNPM_VERSION}" "yarn@${YARN_VERSION}"; \
    node --version; npm --version; pnpm --version; yarn --version; \
    node -e 'const actual=new Intl.DateTimeFormat("zh-CN",{month:"long"}).resolvedOptions().locale; if (actual !== "zh-CN") throw new Error(`full ICU unavailable: ${actual}`); new TextDecoder("latin1"); console.log(`icu ${process.versions.icu}`)'

CMD ["node"]
