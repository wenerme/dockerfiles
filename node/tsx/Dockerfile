# syntax=docker/dockerfile:1

ARG VERSION
FROM wener/node:${VERSION}

RUN --mount=type=cache,target=/root/.npm/ \
    npm add -g tsx esbuild typescript @types/node
