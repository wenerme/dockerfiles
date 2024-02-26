# syntax=docker/dockerfile:1

ARG ALPINE_RELEASE
FROM wener/base:${ALPINE_RELEASE}

ARG TARGETARCH
ARG TARGETVARIANT
RUN --mount=type=cache,id=apk-$TARGETARCH$TARGETVARIANT,sharing=locked,target=/etc/apk/cache \
    apk add nodejs npm make
RUN --mount=type=cache,target=/root/.npm/ \
    npm install -g npm pnpm yarn
