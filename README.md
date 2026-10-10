# Dockerfiles

A curated collection of Alpine-oriented container images maintained by Wener.

## Registries

Images are published under these registry namespaces depending on the image family and migration status:

- Docker Hub: `docker.io/wener/<image>:<tag>`
- Quay: `quay.io/wener/<image>:<tag>`
- GHCR: `ghcr.io/wenerme/dockerfiles/<image>:<tag>`

`manifest.yaml` 是版本与依赖管理入口，当前覆盖四个 variant。其余镜像继续使用各目录 Bake。实时配置和 GHCR 状态可运行 `just status --remote` 查看。

## Tagging

Common tag patterns:

- `latest`: moving tag for the default published variant.
- `<version>`: upstream or runtime version, such as `2.0.0`, `24.17.0`, or `18.4`.
- `<version>-r<N>`: rebuild revision for the same upstream version, such as `2.0.0-r0`.
- `<version>-alpine-<alpine>-r<N>`: version plus Alpine base, useful for repeatable consumption.

Prefer revisioned tags for CI and downstream base images when available.

## Image Index

下面区块通过 `just readme` 生成；区块之外的正文保留手工编辑。

<!-- BEGIN GENERATED IMAGES -->

### Manifest 管理的目标版本

来自 `manifest.yaml`。下表是期望发布的版本，不表示已经发布；用 `just status --remote` 查询 GHCR。

| Variant | Build | 策略 | 目标版本 | Alpine | Base | GHCR canonical ref |
|---|---|---|---|---|---|---|
| `base.default` | [base/base](base/base/) · `base` | alpine | `3.24.1-r0` | 3.24.1 | `scratch / Alpine minirootfs` | `ghcr.io/wenerme/dockerfiles/base:3.24.1-r0` |
| `agent.default` | [agent](agent/) · `agent` | alpine | `3.24.1-r0` | 3.24.1 | `base.default` | `ghcr.io/wenerme/dockerfiles/agent:3.24.1-r0` |
| `pdns.default` | [pdns](pdns/) · `pdns` | app | `5.0.5-r0` | 3.24.1 | `base.default` | `ghcr.io/wenerme/dockerfiles/pdns:5.0.5-r0` |
| `node-builder.default` | [node-builder](node-builder/) · `node-builder` | app-alpine | `24.17.0-alpine-3.24.1-r0` | 3.24.1 | `base.default` | `ghcr.io/wenerme/dockerfiles/node-builder:24.17.0-alpine-3.24.1-r0` |

### 依赖关系

```mermaid
flowchart LR
    i0["base.default<br/>3.24.1-r0"]
    i1["agent.default<br/>3.24.1-r0"]
    i2["pdns.default<br/>5.0.5-r0"]
    i3["node-builder.default<br/>24.17.0-alpine-3.24.1-r0"]
    i0 --> i1
    i0 --> i2
    i0 --> i3
```

### 尚未迁移的 Bake 镜像清单

已跟踪的 Bake 配置共 38 组，manifest 管理 4 个 variant；其余 34 组列在下面。变量是 Bake 文件中的声明默认值，Makefile 或环境变量可能覆盖它们，不能作为已发布版本或运行时版本。

| Image | Directory | Default Targets | Version Variables | Registries | Base Images |
|---|---|---|---|---|---|
| `app` | [app](app/) | app, ssh | ALPINE_RELEASE=3.24.1<br>ALPINE_VERSION=${split(".", ALPINE_RELEASE)[0]}.${split(".", ALPINE_RELEASE)[1]}<br>WORKSPACE_REV=3 | Docker Hub, Quay | `wener/app`<br>`wener/app:3.24.1`<br>`wener/app:3.24.1-ssh`<br>... |
| `base` | [base](base/) | openrc, app | ALPINE_RELEASE=3.17.2<br>ALPINE_VERSION=${split(".", ALPINE_RELEASE)[0]}.${split(".", ALPINE_RELEASE)[1]} | Docker Hub, Quay | `alpine`<br>`scratch`<br>`wener/base`<br>... |
| `builder` | [builder](builder/) | base, default | REV=0<br>ALPINE_RELEASE=3.19.1 | Docker Hub, Quay | `wener/app:3.19.1-ssh`<br>`wener/base:3.19.1` |
| `bun` | [bun](bun/) | base, default | - | Docker Hub, Quay | `oven/bun:${BUN_VERSION}-alpine`<br>`wener/base:${ALPINE_RELEASE}` |
| `caddy` | [caddy](caddy/) | caddy, full, docker-proxy | VERSION=2.8.4<br>REV=0<br>ALPINE_RELEASE=3.20.0 | Docker Hub, Quay | `caddy:2.8.4-builder`<br>`wener/base`<br>`wener/base:3.20.0`<br>... |
| `chromium` | [chromium](chromium/) | base, default | ALPINE_RELEASE=3.18.3 | Docker Hub, Quay | `wener/xvfb:3.18.3` |
| `continue-server` | [continue-server](continue-server/) | base, default | - | Docker Hub, Quay | `wener/base` |
| `dante` | [dante](dante/) | dante | - | Docker Hub, Quay | `wener/base` |
| `debian` | [debian](debian/) | bookworm-backports | - | Docker Hub, Quay | `debian:${VERSION}`<br>`wener/debian` |
| `dnsmasq` | [dnsmasq](dnsmasq/) | base, default | - | Docker Hub, Quay | `wener/base` |
| `docker` | [docker](docker/) | docker | - | Docker Hub, Quay | `wener/base` |
| `frp` | [frp](frp/) | frp, frps, frpc | - | Docker Hub, Quay | `wener/base:${ALPINE_RELEASE}`<br>`wener/frp` |
| `gitea-runner` | [gitea-runner](gitea-runner/) | base, default | REV=0<br>ALPINE_RELEASE=3.19.1<br>ALPINE_VERSION=${split(".", ALPINE_RELEASE)[0]}.${split(".", ALPINE_RELEASE)[1]} | Docker Hub, Quay | `wener/builder:3.19.1-r0` |
| `go-builder` | [go-builder](go-builder/) | go-builder | REV=0<br>ALPINE_RELEASE=3.24.1<br>GO_PACKAGE_VERSION=1.26.3-r0 | Docker Hub, Quay | `wener/go:1.26.3-r0-alpine-3.24.1-r0` |
| `go` | [go](go/) | go | REV=0<br>ALPINE_RELEASE=3.24.1<br>GO_PACKAGE_VERSION=1.26.3-r0 | Docker Hub, Quay | `wener/base:3.24.1`<br>`wener/base:armhf`<br>`wener/go:$VERSION` |
| `httpd` | [httpd](httpd/) | httpd | - | Docker Hub, Quay | `wener/base` |
| `java` | [java](java/) | 8, 8-builder, 8-ui, 17 | - | Docker Hub, Quay | `wener/base`<br>`wener/java`<br>`wener/java:8`<br>... |
| `jenkins` | [jenkins](jenkins/) | agent | - | Docker Hub, Quay | `jenkins/ssh-agent:4.13.0-alpine-jdk17`<br>`jenkins:alpine`<br>`wener/jenkins` |
| `juicefs` | [juicefs](juicefs/) | juicefs | ALPINE_RELEASE=3.18.3 | Docker Hub, Quay | `wener/base:3.18.3` |
| `mihomo` | [mihomo](mihomo/) | mihomo | GO_VERSION=1.25 | Docker Hub, Quay | `golang:1.25-alpine`<br>`wener/base:${ALPINE_RELEASE}` |
| `ml` | [ml](ml/) | pytorch | - | Quay | `python:$PYTHON_VERSION`<br>`quay.io/wener/pytorch:2.5.0-py3.12` |
| `surya-ocr` | [ml/surya-ocr](ml/surya-ocr/) | base | - | Quay | `quay.io/wener/pytorch:2.5.0-py3.12` |
| `nginx` | [nginx](nginx/) | nginx | ALPINE_RELEASE=3.18.3 | Docker Hub, Quay | `wener/base:3.18.3` |
| `node` | [node](node/) | node, docker | ALPINE_RELEASE=3.19.1<br>ALPINE_VERSION=${split(".", ALPINE_RELEASE)[0]}.${split(".", ALPINE_RELEASE)[1]} | Docker Hub, Quay | `wener/base:3.19.1`<br>`wener/node:${VERSION}` |
| `php` | [php](php/) | 81, 82, 83, 84 | ALPINE_RELEASE=3.18.3<br>ALPINE_VERSION=${split(".", ALPINE_RELEASE)[0]}.${split(".", ALPINE_RELEASE)[1]} | Docker Hub, Quay | `wener/base:3.10`<br>`wener/base:3.8`<br>`wener/nginx`<br>... |
| `postgres` | [postgres](postgres/) | postgres | PG_VERSION=18.4<br>PG_REVISION=0 | Docker Hub, Quay, GHCR | `postgres:18.4-alpine3.24` |
| `samba` | [samba](samba/) | samba | ALPINE_RELEASE=3.18.2<br>ALPINE_VERSION=${split(".", ALPINE_RELEASE)[0]}.${split(".", ALPINE_RELEASE)[1]} | Docker Hub, Quay | `wener/app:3.18.2` |
| `sing-box` | [sing-box](sing-box/) | sing-box | ALPINE_RELEASE=3.18.3 | Docker Hub, Quay | `wener/base:3.18.3` |
| `sni-rev-proxy` | [sni-rev-proxy](sni-rev-proxy/) | default | - | Docker Hub, Quay | `wener/base` |
| `next-standalone` | [templates/next-standalone](templates/next-standalone/) | web | - | - | `wener/node:22` |
| `tinyproxy` | [tinyproxy](tinyproxy/) | tinyproxy | - | Docker Hub, Quay | `wener/base:${ALPINE_RELEASE}` |
| `ubuntu` | [ubuntu](ubuntu/) | jammy, focal, bionic, ml | - | Docker Hub, Quay | `scratch`<br>`ubuntu:$VERSION`<br>`wener/ubuntu`<br>... |
| `xray` | [xray](xray/) | xray | - | Docker Hub, Quay | `ghcr.wener.me/xtls/xray-core:${VERSION}`<br>`wener/base:${ALPINE_RELEASE}` |
| `xvfb` | [xvfb](xvfb/) | base, default | ALPINE_RELEASE=3.18.2<br>ALPINE_VERSION=${split(".", ALPINE_RELEASE)[0]}.${split(".", ALPINE_RELEASE)[1]} | Docker Hub, Quay | `wener/app:3.18.2` |

<!-- END GENERATED IMAGES -->

## Development

This repository uses Bun for scripts and [just](https://github.com/casey/just) for commands. Run `just` to list all recipes.

```bash
bun install
just check                 # typecheck, tests, manifest and README checks (same as CI)
just status                # manifest variants and Bake target validation
just status --remote       # also query GHCR canonical tags
just plan base             # dependency-ordered build plan
just publish-plan          # which GHCR tags CI would build
just manifest-bake agent   # GHCR-only Bake JSON preview
just readme                # regenerate the README generated region
```

Useful build commands:

```bash
# Inspect bake output for one image group
cd gitea-runner && make -s print

# Build and push one image group
cd gitea-runner && DOCKER_BUILD_PROGRESS=plain make push
```

## GitHub Actions

- `.github/workflows/ci.yml`：PR 和 master push 时运行 typecheck、测试、manifest 校验、README 区块检查和 Bake target 解析，不构建镜像。
- `.github/workflows/ghcr.yml`：`manifest.yaml` 变更推送到 master 后，按依赖顺序构建并推送 GHCR 上缺失的 canonical tag；已存在的 tag 不会重建，要重新发布就递增 `version.revision`。也可以手动触发，指定镜像、平台或 dry-run。

Docker Hub 和 Quay 仍通过各目录的 `make push` 在本地发布。

## Version Maintenance

Revision bump helpers are intentionally explicit:

manifest 管理的镜像直接维护 `version` 字段：`alpine` → `3.24.1-r0`，`app` → `5.0.5-r0`，`app-alpine` → `24.17.0-alpine-3.24.1-r0`。Alpine 可以沿内部 base 继承。默认 variant 不加前缀，其它 variant 使用 `<variant>-<version>`。

现有 Bake/Make 的默认值没有自动回写。`just manifest-bake` 将 manifest 版本、canonical GHCR 标签、OCI labels 和内部父镜像引用解析为完整 JSON；它是配置预览，不执行构建。`just status` 的 `BAKE TAG=generated` 表示该 canonical 标签需要生成配置，`native` 表示现有 Bake 已声明。

以下旧命令仍然修改各镜像 Bake，用于尚未迁移的镜像。`just plan` 只计算构建依赖顺序，不自动递增下游 revision；周期更新与 revision 传播留待后续接入。

```bash
# Preview / write the next revision for one image group
bun scripts/dockerfiles.ts rev:bump postgres
bun scripts/dockerfiles.ts rev:bump postgres --write

# Record upstream base image digests; bump only when a tracked digest changed
bun scripts/dockerfiles.ts base:check postgres --write
bun scripts/dockerfiles.ts base:check postgres --write --bump
```

`base:check` stores digests in `.github/image-base-digests.json`. Missing digest state is treated as a baseline, not a reason to bump; a changed existing digest is the signal to bump. This keeps scheduled checks idempotent.

## Notes

- Most image groups target `linux/amd64` and `linux/arm64`.
- Docker Hub can be noisy or rate-limited; Quay is often used as a stable build input via bake `contexts`.
- GHCR is available for image groups that declare `ghcr.io/wenerme/dockerfiles/...` tags and when the active Docker config has GHCR credentials.
