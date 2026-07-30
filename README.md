# Dockerfiles

A curated collection of Alpine-oriented container images maintained by Wener.

## Registries

Images are published under these registry namespaces depending on the image family and migration status:

- Docker Hub: `docker.io/wener/<image>:<tag>`
- Quay: `quay.io/wener/<image>:<tag>`
- GHCR: `ghcr.io/wenerme/dockerfiles/<image>:<tag>`

Current scan: 37 image groups, 5 groups already declare GHCR tags in `docker-bake.hcl`.

## Tagging

Common tag patterns:

- `latest`: moving tag for the default published variant.
- `<version>`: upstream or runtime version, such as `2.0.0`, `24.17.0`, or `18.4`.
- `<version>-r<N>`: rebuild revision for the same upstream version, such as `2.0.0-r0`.
- `<version>-alpine-<alpine>-r<N>`: version plus Alpine base, useful for repeatable consumption.

Prefer revisioned tags for CI and downstream base images when available.

## Image Index

Generated from `docker-bake.hcl` files with `bun run readme:generate`.

| Image | Directory | Default Targets | Version Variables | Registries | Base Images |
|---|---|---|---|---|---|
| `app` | [app](app/) | app, ssh | ALPINE_RELEASE=3.18.0<br>ALPINE_VERSION=${split(".", ALPINE_RELEASE)[0]}.${split(".", ALPINE_RELEASE)[1]} | Docker Hub, Quay | `wener/app`<br>`wener/app:${ALPINE_RELEASE}`<br>`wener/app:dns`<br>... |
| `base` | [base/base](base/base/) | base | REV=0<br>ALPINE_RELEASE=3.24.1<br>ALPINE_VERSION=${split(".", ALPINE_RELEASE)[0]}.${split(".", ALPINE_RELEASE)[1]} | Docker Hub, Quay, GHCR | `scratch` |
| `base` | [base](base/) | openrc, app | ALPINE_RELEASE=3.17.2<br>ALPINE_VERSION=${split(".", ALPINE_RELEASE)[0]}.${split(".", ALPINE_RELEASE)[1]} | Docker Hub, Quay | `alpine`<br>`scratch`<br>`wener/base`<br>... |
| `builder` | [builder](builder/) | base, default | REV=0<br>ALPINE_RELEASE=3.19.1 | Docker Hub, Quay | `wener/app:${ALPINE_RELEASE}-ssh`<br>`wener/base:${ALPINE_RELEASE}` |
| `bun` | [bun](bun/) | base, default | - | Docker Hub, Quay | `oven/bun:${BUN_VERSION}-alpine`<br>`wener/base:${ALPINE_RELEASE}` |
| `caddy` | [caddy](caddy/) | caddy, full, docker-proxy | VERSION=2.8.4<br>REV=0<br>ALPINE_RELEASE=3.20.0 | Docker Hub, Quay | `abiosoft/caddy:builder`<br>`caddy:${VERSION}-builder`<br>`wener/base`<br>... |
| `chromium` | [chromium](chromium/) | base, default | ALPINE_RELEASE=3.18.3 | Docker Hub, Quay | `wener/xvfb:${ALPINE_RELEASE}` |
| `continue-server` | [continue-server](continue-server/) | base, default | - | Docker Hub, Quay | `wener/base` |
| `dante` | [dante](dante/) | dante | - | Docker Hub, Quay | `wener/base`<br>`wener/base:svc` |
| `debian` | [debian](debian/) | bookworm-backports | - | Docker Hub, Quay | `debian:${VERSION}`<br>`debian:trixie`<br>`wener/debian`<br>... |
| `dnsmasq` | [dnsmasq](dnsmasq/) | base, default | - | Docker Hub, Quay | `wener/base` |
| `docker` | [docker](docker/) | docker | - | Docker Hub, Quay | `wener/base` |
| `frp` | [frp](frp/) | frp, frps, frpc | - | Docker Hub, Quay | `wener/base:${ALPINE_RELEASE}`<br>`wener/frp` |
| `gitea-runner` | [gitea-runner](gitea-runner/) | base, default | REV=0<br>ALPINE_RELEASE=3.19.1<br>ALPINE_VERSION=${split(".", ALPINE_RELEASE)[0]}.${split(".", ALPINE_RELEASE)[1]} | Docker Hub, Quay | `wener/builder:${ALPINE_RELEASE}-r${BUILDER_REV}` |
| `go-builder` | [go-builder](go-builder/) | go-builder | REV=0<br>ALPINE_VERSION=3.24<br>GO_VERSION=1.26.4 | Docker Hub, Quay, GHCR | `${GO_BASE_IMAGE}` |
| `go` | [go](go/) | go | ALPINE_RELEASE=3.19.1<br>ALPINE_VERSION=${split(".", ALPINE_RELEASE)[0]}.${split(".", ALPINE_RELEASE)[1]} | Docker Hub, Quay | `wener/base:${ALPINE_RELEASE}`<br>`wener/base:armhf`<br>`wener/go`<br>... |
| `httpd` | [httpd](httpd/) | httpd | - | Docker Hub, Quay | `wener/base` |
| `java` | [java](java/) | 8, 8-builder, 8-ui, 17 | - | Docker Hub, Quay | `wener/base`<br>`wener/java`<br>`wener/java:8`<br>... |
| `jenkins` | [jenkins](jenkins/) | agent | - | Docker Hub, Quay | `jenkins/ssh-agent:4.13.0-alpine-jdk17`<br>`jenkins:alpine`<br>`wener/jenkins` |
| `juicefs` | [juicefs](juicefs/) | juicefs | ALPINE_RELEASE=3.18.3 | Docker Hub, Quay | `wener/base:${ALPINE_RELEASE}` |
| `mihomo` | [mihomo](mihomo/) | mihomo | GO_VERSION=1.25 | Docker Hub, Quay | `golang:${GO_VERSION}-alpine`<br>`wener/base:${ALPINE_RELEASE}` |
| `ml` | [ml](ml/) | pytorch | - | Quay | `python:$PYTHON_VERSION`<br>`quay.io/wener/pytorch:2.5.0-py3.12` |
| `surya-ocr` | [ml/surya-ocr](ml/surya-ocr/) | base | - | Quay | `quay.io/wener/pytorch:2.5.0-py3.12` |
| `nginx` | [nginx](nginx/) | nginx | ALPINE_RELEASE=3.18.3 | Docker Hub, Quay | `wener/base:${ALPINE_RELEASE}` |
| `node-builder` | [node-builder](node-builder/) | node-builder | VERSION=24.17.0<br>REV=0<br>ALPINE_RELEASE=3.24.1<br>ALPINE_VERSION=3.24 | Docker Hub, Quay, GHCR | `wener/base:${ALPINE_RELEASE}` |
| `node` | [node](node/) | node, docker | ALPINE_RELEASE=3.19.1<br>ALPINE_VERSION=${split(".", ALPINE_RELEASE)[0]}.${split(".", ALPINE_RELEASE)[1]} | Docker Hub, Quay | `wener/base:${ALPINE_RELEASE}`<br>`wener/node:${VERSION}` |
| `pdns` | [pdns](pdns/) | pdns | VERSION=5.0.5<br>REV=0<br>ALPINE_RELEASE=3.24.1<br>ALPINE_VERSION=3.24 | Docker Hub, Quay, GHCR | `wener/base:${ALPINE_RELEASE}` |
| `php` | [php](php/) | 81, 82, 83, 84 | ALPINE_RELEASE=3.18.3<br>ALPINE_VERSION=${split(".", ALPINE_RELEASE)[0]}.${split(".", ALPINE_RELEASE)[1]} | Docker Hub, Quay | `spiralscout/roadrunner:2.9.1`<br>`wener/base`<br>`wener/base:3.10`<br>... |
| `postgres` | [postgres](postgres/) | postgres | PG_VERSION=18.4 | Docker Hub, Quay, GHCR | `build`<br>`postgres:${PG_IMAGE_VERSION}-alpine${PG_ALPINE_VERSION}` |
| `samba` | [samba](samba/) | samba | ALPINE_RELEASE=3.18.2<br>ALPINE_VERSION=${split(".", ALPINE_RELEASE)[0]}.${split(".", ALPINE_RELEASE)[1]} | Docker Hub, Quay | `wener/app:${ALPINE_RELEASE}` |
| `sing-box` | [sing-box](sing-box/) | sing-box | ALPINE_RELEASE=3.18.3 | Docker Hub, Quay | `wener/base:${ALPINE_RELEASE}` |
| `sni-rev-proxy` | [sni-rev-proxy](sni-rev-proxy/) | default | - | Docker Hub, Quay | `wener/base` |
| `next-standalone` | [templates/next-standalone](templates/next-standalone/) | web | - | - | `wener/node:22` |
| `tinyproxy` | [tinyproxy](tinyproxy/) | tinyproxy | - | Docker Hub, Quay | `wener/base:${ALPINE_RELEASE}` |
| `ubuntu` | [ubuntu](ubuntu/) | jammy, focal, bionic, ml | - | Docker Hub, Quay | `scratch`<br>`ubuntu:$VERSION`<br>`wener/ubuntu`<br>... |
| `xray` | [xray](xray/) | xray | - | Docker Hub, Quay | `ghcr.wener.me/xtls/xray-core:${VERSION}`<br>`wener/base:${ALPINE_RELEASE}` |
| `xvfb` | [xvfb](xvfb/) | base, default | ALPINE_RELEASE=3.18.2<br>ALPINE_VERSION=${split(".", ALPINE_RELEASE)[0]}.${split(".", ALPINE_RELEASE)[1]} | Docker Hub, Quay | `wener/app:${ALPINE_RELEASE}` |

## Development

This repository uses Bun for local scripts.

```bash
bun install
bun run scan:images
bun run readme:generate
```

Useful build commands:

```bash
# Inspect bake output for one image group
cd gitea-runner && make print

# Build and push one image group
cd gitea-runner && DOCKER_BUILD_PROGRESS=plain make push
```

## GitHub Actions

Current GHCR publishing trials:

- `.github/workflows/base-ghcr.yml`: publishes `ghcr.io/wenerme/dockerfiles/base:*` from `base/base/docker-bake.hcl`.
- `.github/workflows/postgres-ghcr.yml`: publishes `ghcr.io/wenerme/dockerfiles/postgres:*` from `postgres/docker-bake.hcl`.
- `.github/workflows/base-digest-check.yml`: checks tracked upstream base image digests and opens a revision-bump PR when a digest changes.

The publish workflows support manual `workflow_dispatch` and selected `master` push paths. They generate temporary GHCR-only bake overrides and check the canonical revision tag before building. If the finest revision tag already exists, the build is skipped unless `force=true`.

## Version Maintenance

Revision bump helpers are intentionally explicit:

```bash
# Preview the next revision for one image group
bun run rev:bump -- postgres

# Write the revision bump
bun run rev:bump -- postgres --write

# Record current upstream base image digests without bumping
bun run base:check -- postgres --write

# Prepare a GHCR-only bake override and check whether the canonical tag already exists
bun run ghcr:prepare -- postgres

# On future checks, bump PG_REVISION only when a tracked base digest changed
bun run base:check -- postgres --write --bump
```

`base:check` stores digests in `.github/image-base-digests.json`. Missing digest state is treated as a baseline, not a reason to bump; a changed existing digest is the signal to bump. This keeps scheduled checks idempotent.

## Notes

- Most image groups target `linux/amd64` and `linux/arm64`.
- Docker Hub can be noisy or rate-limited; Quay is often used as a stable build input via bake `contexts`.
- GHCR is available for image groups that declare `ghcr.io/wenerme/dockerfiles/...` tags and when the active Docker config has GHCR credentials.
