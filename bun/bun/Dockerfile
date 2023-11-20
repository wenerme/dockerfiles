ARG BUN_VERSION

FROM oven/bun:${BUN_VERSION}-alpine as builder

# glibc 需要从源码构建才能用
# https://github.com/sgerrand/alpine-pkg-glibc/issues/176
# https://github.com/sgerrand/alpine-pkg-glibc
# https://github.com/oven-sh/bun/blob/main/dockerhub/alpine/Dockerfile

FROM wener/base

COPY --from=builder /usr/local/bin/bun /usr/local/bin/bun

ARG GLIBC_VERSION=2.34-r0
RUN set -ex \
    && cd /tmp  \
    && curl --remote-name-all -sfL https://github.com/sgerrand/alpine-pkg-glibc/releases/download/${GLIBC_VERSION}/glibc{,-bin,-dev,-i18n}-${GLIBC_VERSION}.apk \
    && apk del gcompat  \
    && apk add glibc{,-bin,-dev,-i18n}-${GLIBC_VERSION}.apk --no-cache --force-overwrite --allow-untrusted  \
    && rm -rf /tmp/* \
    && ln -s /usr/local/bin/bun /usr/local/bin/bunx \
    && which bun \
    && which bunx \
    && bun --version
