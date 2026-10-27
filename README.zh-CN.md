# Dockerfiles

[English](README.md) | 中文

Wener 维护的容器镜像，大多基于 Alpine Linux，提供 `linux/amd64` 和 `linux/arm64` 版本。

## 镜像仓库

| 仓库 | 镜像地址 |
|---|---|
| GHCR | `ghcr.io/wenerme/dockerfiles/<image>:<tag>` |
| Docker Hub | `docker.io/wener/<image>:<tag>` |
| Quay | `quay.io/wener/<image>:<tag>` |

[受管理镜像](#受管理镜像)发布到 GHCR，其中 PHP 也同步到 Docker Hub。[其他镜像](#其他镜像)从各自目录发布，通常推送到 Docker Hub 和 Quay。

```bash
docker pull ghcr.io/wenerme/dockerfiles/php:8.4
docker pull wener/php:8.4
```

## 标签

| 标签 | 含义 | 示例 |
|---|---|---|
| `<version>-r<N>` | 完整版本标签：上游版本加构建 revision | `5.0.7-r2` |
| `<version>-alpine-<alpine>-r<N>` | 同时记录 Alpine 版本的完整版本标签 | `24.17.0-alpine-3.24.2-r1` |
| `<variant>-<完整版本标签>` | 变体的完整版本标签 | `8.4-8.4.27-r0-alpine-3.24.2-r0` |
| 短标签 | 跟随最新完整版本标签的移动标签 | `8.4`、`8.4-alpine-3.24.2`、`latest` |

完整版本标签不会被覆盖。需要可复现部署时固定完整版本标签或 digest；需要自动获得更新时使用短标签。版本不变而重新构建时 revision `r<N>` 递增，例如带上 Alpine 安全更新；版本升级后从 `r0` 重新开始。

## 注意事项

- 基于 `wener/base` 的镜像在 `/etc/apk/repositories` 中使用清华 TUNA Alpine 镜像源（`mirrors.tuna.tsinghua.edu.cn`）。
- Debian 镜像的 apt 使用清华 TUNA 镜像源并启用 backports；构建时仍从 `deb.debian.org` 安装软件包。
- PHP 8.2 停留在 Alpine 3.19 和 PHP 8.2.26，不再更新，请使用 PHP 8.4 或 8.5。
- 受管理镜像带有 OCI 标签 `org.opencontainers.image.source`、`org.opencontainers.image.version` 和 `org.opencontainers.image.revision`。

## 镜像列表

<!-- BEGIN GENERATED IMAGES -->

### 受管理镜像

发布到 GHCR。完整版本标签不会被覆盖；短标签跟随最新的完整版本标签。

| 镜像 | 完整版本标签 | 短标签 | Alpine | 基础镜像 | 源码 |
|---|---|---|---|---|---|
| base | `ghcr.io/wenerme/dockerfiles/base:3.24.3-r0` | - | 3.24.3 | `scratch (Alpine minirootfs)` | [base/base](base/base/) |
| base openrc | `ghcr.io/wenerme/dockerfiles/base:openrc-3.24.3-r0` | `openrc`<br>`3.24.3-openrc` | 3.24.3 | `base` | [base](base/) |
| app | `ghcr.io/wenerme/dockerfiles/app:3.24.3-r0` | `latest`<br>`3.24.3` | 3.24.3 | `base:openrc` | [app](app/) |
| app ssh | `ghcr.io/wenerme/dockerfiles/app:ssh-3.24.3-r0` | `ssh`<br>`3.24.3-ssh` | 3.24.3 | `app` | [app](app/) |
| app workspace | `ghcr.io/wenerme/dockerfiles/app:workspace-3.24.3-r0` | `workspace`<br>`3.24.3-workspace` | 3.24.3 | `app:ssh` | [app](app/) |
| agent | `ghcr.io/wenerme/dockerfiles/agent:3.24.3-r0` | - | 3.24.3 | `base` | [agent](agent/) |
| pdns | `ghcr.io/wenerme/dockerfiles/pdns:5.0.7-r3` | - | 3.24.3 | `base` | [pdns](pdns/) |
| node 26 | `ghcr.io/wenerme/dockerfiles/node:26-26.12.1-alpine-3.24.3-r0` | `26`<br>`26.12.1`<br>`latest` | 3.24.3 | `base` | [node](node/) |
| node 24 | `ghcr.io/wenerme/dockerfiles/node:24-24.22.1-alpine-3.24.3-r0` | `24`<br>`24.22.1` | 3.24.3 | `base` | [node](node/) |
| frp | `ghcr.io/wenerme/dockerfiles/frp:0.71.1-alpine-3.24.3-r0` | `0.71.1`<br>`latest` | 3.24.3 | `base` | [frp](frp/) |
| frpc | `ghcr.io/wenerme/dockerfiles/frpc:0.71.1-alpine-3.24.3-r0` | `0.71.1`<br>`latest` | 3.24.3 | `base` | [frp](frp/) |
| frps | `ghcr.io/wenerme/dockerfiles/frps:0.71.1-alpine-3.24.3-r0` | `0.71.1`<br>`latest` | 3.24.3 | `base` | [frp](frp/) |
| bun | `ghcr.io/wenerme/dockerfiles/bun:1.4.4-alpine-3.24.3-r0` | `1.4.4`<br>`latest` | 3.24.3 | `base` | [bun](bun/) |
| node-builder | `ghcr.io/wenerme/dockerfiles/node-builder:24.22.1-alpine-3.24.3-r0` | - | 3.24.3 | `base` | [node-builder](node-builder/) |
| go | `ghcr.io/wenerme/dockerfiles/go:1.26.10-r0-alpine-3.24.3-r0` | `latest` | 3.24.3 | `base` | [go](go/) |
| go-builder | `ghcr.io/wenerme/dockerfiles/go-builder:1.26.10-r0-alpine-3.24.3-r0` | - | 3.24.3 | `go` | [go-builder](go-builder/) |
| nginx | `ghcr.io/wenerme/dockerfiles/nginx:1.30.6-r0-alpine-3.24.3-r0` | - | 3.24.3 | `base` | [nginx](nginx/) |
| php 8.2 | `ghcr.io/wenerme/dockerfiles/php:8.2-8.2.26-r0-alpine-3.19.1-r0` | `8.2`<br>`8.2-alpine-3.19.1` | 3.19.1 | `quay.io/wener/nginx:alpine-3.19.1` | [php](php/) |
| php 8.3 | `ghcr.io/wenerme/dockerfiles/php:8.3-8.3.36-r0-alpine-3.24.3-r1` | `8.3`<br>`8.3-alpine-3.24.3` | 3.24.3 | `nginx` | [php](php/) |
| php 8.4 | `ghcr.io/wenerme/dockerfiles/php:8.4-8.4.27-r0-alpine-3.24.3-r1` | `8.4`<br>`8.4-alpine-3.24.3` | 3.24.3 | `nginx` | [php](php/) |
| php 8.5 | `ghcr.io/wenerme/dockerfiles/php:8.5-8.5.12-r0-alpine-3.24.3-r1` | `8.5`<br>`8.5-alpine-3.24.3` | 3.24.3 | `nginx` | [php](php/) |
| debian | `ghcr.io/wenerme/dockerfiles/debian:13.7-r0` | `13`<br>`trixie`<br>`latest` | - | `docker.io/library/debian:13.7` | [debian](debian/) |
| debian bookworm | `ghcr.io/wenerme/dockerfiles/debian:bookworm-12.15-r0` | `12`<br>`bookworm` | - | `docker.io/library/debian:12.15` | [debian](debian/) |

### 其他镜像

26 个镜像组从各自目录发布，镜像仓库和标签见各目录。变体列出额外的镜像变体，基础镜像列出父镜像仓库。

| 镜像 | 变体 | 基础镜像 |
|---|---|---|
| [builder](builder/) | - | `wener/app`<br>`wener/base` |
| [caddy](caddy/) | full, docker-proxy | `caddy`<br>`wener/base` |
| [chromium](chromium/) | - | `wener/xvfb` |
| [continue-server](continue-server/) | - | `wener/base` |
| [dante](dante/) | - | `wener/base` |
| [dev](dev/) | - | `wener/node` |
| [dnsmasq](dnsmasq/) | - | `wener/base` |
| [docker](docker/) | - | `wener/base` |
| [gitea-runner](gitea-runner/) | - | `wener/builder` |
| [httpd](httpd/) | - | `wener/base` |
| [java](java/) | 8, 8-builder, 8-ui, 17 | `wener/base` |
| [jenkins](jenkins/) | agent | `jenkins`<br>`jenkins/ssh-agent` |
| [juicefs](juicefs/) | - | `wener/base` |
| [ligolo-ng](ligolo-ng/) | - | `golang`<br>`wener/base` |
| [mihomo](mihomo/) | - | `golang`<br>`wener/base` |
| [ml](ml/) | pytorch | `python`<br>`quay.io/wener/pytorch` |
| [surya-ocr](ml/surya-ocr/) | - | `quay.io/wener/pytorch` |
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

## 许可证

[MIT](LICENSE)
