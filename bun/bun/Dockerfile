ARG VERSION=1.4.4
ARG ALPINE_RELEASE=3.24.3

# The official Alpine image carries the musl build of bun; only the binary is reused.
FROM oven/bun:${VERSION}-alpine AS bun

FROM wener/base:${ALPINE_RELEASE}

LABEL org.opencontainers.image.description="Bun (musl build from oven/bun) on Alpine"

RUN apk add --no-cache libgcc libstdc++

# Disable the runtime transpiler cache: it is not useful in ephemeral containers. Keep `bun install -g` on PATH.
ENV BUN_RUNTIME_TRANSPILER_CACHE_PATH=0 \
    BUN_INSTALL_BIN=/usr/local/bin

COPY --from=bun /usr/local/bin/bun /usr/local/bin/bun

RUN set -eux; \
    ln -s bun /usr/local/bin/bunx; \
    bun --version; \
    bunx --version

CMD ["bun"]
