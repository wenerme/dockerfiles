# syntax=docker/dockerfile:1

FROM wener/base

RUN apk add --no-cache nodejs yarn npm make && npm install -g npm pnpm && npm cache clean --force
