# Dockerfiles

English | [中文](README.zh-CN.md)

Container images maintained by Wener, mostly based on Alpine Linux and built for `linux/amd64` and `linux/arm64`.

## Registries

| Registry | Image reference |
|---|---|
| GHCR | `ghcr.io/wenerme/dockerfiles/<image>:<tag>` |
| Docker Hub | `docker.io/wener/<image>:<tag>` |
| Quay | `quay.io/wener/<image>:<tag>` |

[Managed images](#managed-images) are published to GHCR; PHP is also available on Docker Hub. [Other images](#other-images) are published from their own directories, usually to Docker Hub and Quay.

```bash
docker pull ghcr.io/wenerme/dockerfiles/php:8.4
docker pull wener/php:8.4
```

## Tags

| Tag | Meaning | Example |
|---|---|---|
| `<version>-r<N>` | Canonical tag: upstream version and build revision | `5.0.7-r2` |
| `<version>-alpine-<alpine>-r<N>` | Canonical tag that also records the Alpine release | `24.17.0-alpine-3.24.2-r1` |
| `<variant>-<canonical>` | Canonical tag of a variant | `8.4-8.4.27-r0-alpine-3.24.2-r0` |
| Short tag | Moving tag that follows the latest canonical tag | `8.4`, `8.4-alpine-3.24.2`, `latest` |

Canonical tags are never overwritten. Pin a canonical tag or digest for reproducible deployments, and use a short tag to receive updates. The revision `r<N>` increases when an image is rebuilt without a version change, for example to pick up Alpine security fixes; a new version starts again at `r0`.

## Notes

- Images built on `wener/base` use the TUNA Alpine mirror (`mirrors.tuna.tsinghua.edu.cn`) in `/etc/apk/repositories`.
- PHP 8.2 remains on Alpine 3.19 with PHP 8.2.26 and no longer receives updates. Use PHP 8.4 or 8.5.
- Managed images carry the OCI labels `org.opencontainers.image.source`, `org.opencontainers.image.version`, and `org.opencontainers.image.revision`.

## Images

<!-- BEGIN GENERATED IMAGES -->

### Managed Images

Published to GHCR. Canonical tags are never overwritten; short tags follow the latest canonical tag.

| Image | Canonical tag | Short tags | Alpine | Base | Source |
|---|---|---|---|---|---|
| base | `ghcr.io/wenerme/dockerfiles/base:3.24.3-r0` | - | 3.24.3 | `scratch (Alpine minirootfs)` | [base/base](base/base/) |
| agent | `ghcr.io/wenerme/dockerfiles/agent:3.24.3-r0` | - | 3.24.3 | `base` | [agent](agent/) |
| pdns | `ghcr.io/wenerme/dockerfiles/pdns:5.0.7-r3` | - | 3.24.3 | `base` | [pdns](pdns/) |
| node-builder | `ghcr.io/wenerme/dockerfiles/node-builder:24.22.1-alpine-3.24.3-r0` | - | 3.24.3 | `base` | [node-builder](node-builder/) |
| go-builder | `ghcr.io/wenerme/dockerfiles/go-builder:1.26.3-r0-alpine-3.24.1-r0` | - | 3.24.1 | `quay.io/wener/go:1.26.3-r0-alpine-3.24.1-r0` | [go-builder](go-builder/) |
| nginx | `ghcr.io/wenerme/dockerfiles/nginx:1.30.4-r1-alpine-3.24.3-r0` | - | 3.24.3 | `base` | [nginx](nginx/) |
| php 8.2 | `ghcr.io/wenerme/dockerfiles/php:8.2-8.2.26-r0-alpine-3.19.1-r0` | `8.2`<br>`8.2-alpine-3.19.1` | 3.19.1 | `quay.io/wener/nginx:alpine-3.19.1` | [php](php/) |
| php 8.3 | `ghcr.io/wenerme/dockerfiles/php:8.3-8.3.36-r0-alpine-3.24.3-r0` | `8.3`<br>`8.3-alpine-3.24.3` | 3.24.3 | `nginx` | [php](php/) |
| php 8.4 | `ghcr.io/wenerme/dockerfiles/php:8.4-8.4.27-r0-alpine-3.24.3-r0` | `8.4`<br>`8.4-alpine-3.24.3` | 3.24.3 | `nginx` | [php](php/) |
| php 8.5 | `ghcr.io/wenerme/dockerfiles/php:8.5-8.5.12-r0-alpine-3.24.3-r0` | `8.5`<br>`8.5-alpine-3.24.3` | 3.24.3 | `nginx` | [php](php/) |

### Other Images

33 image groups published from their own directories; see each directory for registries and tags. Variants lists additional image variants; Base lists parent image repositories.

| Image | Variants | Base |
|---|---|---|
| [app](app/) | ssh | `wener/base` |
| [base](base/) | openrc, app | `alpine`<br>`wener/base` |
| [builder](builder/) | - | `wener/app`<br>`wener/base` |
| [bun](bun/) | - | `oven/bun`<br>`wener/base` |
| [caddy](caddy/) | full, docker-proxy | `caddy`<br>`wener/base` |
| [chromium](chromium/) | - | `wener/xvfb` |
| [continue-server](continue-server/) | - | `wener/base` |
| [dante](dante/) | - | `wener/base` |
| [debian](debian/) | bookworm-backports | `debian` |
| [dev](dev/) | - | `wener/node` |
| [dnsmasq](dnsmasq/) | - | `wener/base` |
| [docker](docker/) | - | `wener/base` |
| [frp](frp/) | frps, frpc | `wener/base` |
| [gitea-runner](gitea-runner/) | - | `wener/builder` |
| [go](go/) | - | `wener/base` |
| [httpd](httpd/) | - | `wener/base` |
| [java](java/) | 8, 8-builder, 8-ui, 17 | `wener/base` |
| [jenkins](jenkins/) | agent | `jenkins`<br>`jenkins/ssh-agent` |
| [juicefs](juicefs/) | - | `wener/base` |
| [ligolo-ng](ligolo-ng/) | - | `golang`<br>`wener/base` |
| [mihomo](mihomo/) | - | `golang`<br>`wener/base` |
| [ml](ml/) | pytorch | `python`<br>`quay.io/wener/pytorch` |
| [surya-ocr](ml/surya-ocr/) | - | `quay.io/wener/pytorch` |
| [node](node/) | docker | `wener/base` |
| [postgres](postgres/) | - | `postgres` |
| [samba](samba/) | - | `wener/app` |
| [sing-box](sing-box/) | - | `wener/base` |
| [sni-rev-proxy](sni-rev-proxy/) | - | `wener/base` |
| [next-standalone](templates/next-standalone/) | web | `wener/node` |
| [tinyproxy](tinyproxy/) | - | `wener/base` |
| [ubuntu](ubuntu/) | jammy, focal, bionic, ml | `ubuntu` |
| [xray](xray/) | - | `ghcr.wener.me/xtls/xray-core`<br>`wener/base` |
| [xvfb](xvfb/) | - | `wener/app` |

<!-- END GENERATED IMAGES -->

## License

[MIT](LICENSE)
