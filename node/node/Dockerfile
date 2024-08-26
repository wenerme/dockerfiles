# syntax=docker/dockerfile:1

ARG ALPINE_RELEASE
FROM wener/base:${ALPINE_RELEASE}

ARG TARGETARCH
ARG TARGETVARIANT
# add icu-data-full for `new TextDecoder('latin1')` to work
#   avoid The "windows-1252" encoding is not supported
RUN --mount=type=cache,id=apk-$TARGETARCH$TARGETVARIANT,sharing=locked,target=/etc/apk/cache \
    apk add nodejs npm make icu-data-full
RUN --mount=type=cache,target=/root/.npm/ \
    npm install -g npm pnpm yarn
