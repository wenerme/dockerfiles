ARG BUN_VERSION=1.1.38
ARG ALPINE_RELEASE=3.21.0

FROM oven/bun:${BUN_VERSION}-alpine AS builder

# https://github.com/oven-sh/bun/blob/main/dockerhub/alpine/Dockerfile

FROM wener/base:${ALPINE_RELEASE}

RUN apk add --no-cache libgcc libstdc++

# Disable the runtime transpiler cache by default inside Docker containers.
# On ephemeral containers, the cache is not useful
ARG BUN_RUNTIME_TRANSPILER_CACHE_PATH=0
ENV BUN_RUNTIME_TRANSPILER_CACHE_PATH=${BUN_RUNTIME_TRANSPILER_CACHE_PATH}

# Ensure `bun install -g` works
ARG BUN_INSTALL_BIN=/usr/local/bin
ENV BUN_INSTALL_BIN=${BUN_INSTALL_BIN}

COPY --from=builder /usr/local/bin/bun /usr/local/bin/bun

# When MUSL ready
RUN ln -s /usr/local/bin/bun /usr/local/bin/bunx \
    && which bun \
    && which bunx \
    && bun --version \

# glibc 需要从源码构建才能用
# https://github.com/sgerrand/alpine-pkg-glibc/issues/176
# https://github.com/sgerrand/alpine-pkg-glibc
#ARG GLIBC_VERSION=2.34-r0
#RUN set -ex \
#    && cd /tmp  \
#    && curl --remote-name-all -sfL https://github.com/sgerrand/alpine-pkg-glibc/releases/download/${GLIBC_VERSION}/glibc{,-bin,-dev,-i18n}-${GLIBC_VERSION}.apk \
#    && apk del gcompat  \
#    && apk add glibc{,-bin,-dev,-i18n}-${GLIBC_VERSION}.apk --no-cache --force-overwrite --allow-untrusted  \
#    && rm -rf /tmp/* \
#    && ln -s /usr/local/bin/bun /usr/local/bin/bunx \
#    && which bun \
#    && which bunx \
#    && bun --version
