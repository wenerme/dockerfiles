# syntax=docker/dockerfile:1

ARG ALPINE_VERSION
FROM wener/base:${ALPINE_VERSION}

RUN apk add --no-cache nodejs npm make
RUN --mount=type=cache,target=/root/.npm/ \
    npm install -g npm pnpm yarn
