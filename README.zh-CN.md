# Dockerfiles

[English](README.md) | 简体中文

由 Wener 维护的容器镜像定义、构建配置和发布工具。大多数镜像基于 Alpine Linux。

## 镜像仓库

各镜像家族使用以下仓库命名空间：

- Docker Hub：`docker.io/wener/<image>:<tag>`
- Quay：`quay.io/wener/<image>:<tag>`
- GHCR：`ghcr.io/wenerme/dockerfiles/<image>:<tag>`

[manifest.yaml](manifest.yaml) 定义 GHCR 发布流程使用的版本和构建依赖。其他 Bake 镜像组使用各自目录中的配置。`just status --remote` 显示受管理的变体及其 GHCR 发布状态。

## 标签

| 格式 | 含义 | 示例 |
|---|---|---|
| `latest` | 默认变体的浮动标签，部分镜像发布此标签 | `latest` |
| `<version>` | 上游应用或运行时版本 | `24.17.0` |
| `<version>-r<N>` | 同一上游版本的构建修订 | `5.0.7-r0` |
| `<version>-alpine-<alpine>-r<N>` | 应用版本、Alpine 发行版本和构建修订 | `24.17.0-alpine-3.24.1-r0` |

Manifest 变体使用以 `-r<N>` 结尾的 canonical 标签。非默认变体增加 `<variant>-` 前缀，例如 `openrc-3.24.1-r0`。发布流程跳过已有的 canonical 标签；重新构建需要修改版本或 revision。

## 镜像索引

索引由 `manifest.yaml` 和 Git 已跟踪的 Bake 配置生成。`just readme` 同时更新中英文版本的生成区块，标记之外的正文手工维护。

<!-- BEGIN GENERATED IMAGES -->

### Manifest 发布目标

`manifest.yaml` 中定义的目标版本。发布状态可通过 `just status --remote` 查询。

| 变体 | 构建 | 版本策略 | 目标版本 | Alpine | 基础镜像 | GHCR canonical 引用 |
|---|---|---|---|---|---|---|
| `base.default` | [base/base](base/base/) · `base` | alpine | `3.24.1-r0` | 3.24.1 | `scratch / Alpine minirootfs` | `ghcr.io/wenerme/dockerfiles/base:3.24.1-r0` |
| `agent.default` | [agent](agent/) · `agent` | alpine | `3.24.1-r0` | 3.24.1 | `base.default` | `ghcr.io/wenerme/dockerfiles/agent:3.24.1-r0` |
| `pdns.default` | [pdns](pdns/) · `pdns` | app | `5.0.7-r0` | 3.24.1 | `base.default` | `ghcr.io/wenerme/dockerfiles/pdns:5.0.7-r0` |
| `node-builder.default` | [node-builder](node-builder/) · `node-builder` | app-alpine | `24.17.0-alpine-3.24.1-r0` | 3.24.1 | `base.default` | `ghcr.io/wenerme/dockerfiles/node-builder:24.17.0-alpine-3.24.1-r0` |
| `go-builder.default` | [go-builder](go-builder/) · `go-builder` | app-alpine | `1.26.3-r0-alpine-3.24.1-r0` | 3.24.1 | `quay.io/wener/go:1.26.3-r0-alpine-3.24.1-r0@sha256:e2abf60cd8c81a1705edd458c81047ceda81349ec06d90149058b5053a7a7350` | `ghcr.io/wenerme/dockerfiles/go-builder:1.26.3-r0-alpine-3.24.1-r0` |
| `nginx.default` | [nginx](nginx/) · `nginx` | app-alpine | `1.30.4-r1-alpine-3.24.1-r0` | 3.24.1 | `base.default` | `ghcr.io/wenerme/dockerfiles/nginx:1.30.4-r1-alpine-3.24.1-r0` |
| `php.8.2` | [php](php/) · `82` | app-alpine | `8.2-8.2.26-r0-alpine-3.19.1-r0` | 3.19.1 | `quay.io/wener/nginx:alpine-3.19.1@sha256:1da7b7845bed8cc54efb93d7289cb89c2bf87656159258a51ed7c0c3e1c449a5` | `ghcr.io/wenerme/dockerfiles/php:8.2-8.2.26-r0-alpine-3.19.1-r0` |
| `php.8.3` | [php](php/) · `83` | app-alpine | `8.3-8.3.35-r0-alpine-3.24.1-r0` | 3.24.1 | `nginx.default` | `ghcr.io/wenerme/dockerfiles/php:8.3-8.3.35-r0-alpine-3.24.1-r0` |
| `php.8.4` | [php](php/) · `84` | app-alpine | `8.4-8.4.26-r0-alpine-3.24.1-r0` | 3.24.1 | `nginx.default` | `ghcr.io/wenerme/dockerfiles/php:8.4-8.4.26-r0-alpine-3.24.1-r0` |

### 其他 Bake 镜像组

共 40 个已跟踪的 Bake 镜像组，manifest 管理 9 个变体。下列 33 个镜像组尚未纳入 manifest。变体列出非默认的 Bake target，基础镜像仅列出父镜像仓库。

| 镜像 | 变体 | 基础镜像 |
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

## 开发

依赖 Bun、[just](https://github.com/casey/just) 1.58.0 或更新版本，以及带 Buildx 插件的 Docker。Bun 版本在 `package.json` 中声明，`just/common.just` 强制检查 just 最低版本。

仓库工具由 `dfcli` 提供，入口为 `scripts/dfcli/main.ts`，基于 commander。`just` 列出可用任务，`just dfcli --help` 列出 CLI 命令。

```bash
bun install --frozen-lockfile
just --jobs 3 check        # 并行执行独立检查，最多同时运行三个任务
just status                # Manifest 变体与 Bake target 校验
just status --remote       # 同时查询 GHCR 发布状态
just plan base             # 受影响变体及其前置依赖的构建顺序
just publish-plan          # 预览需要构建的 GHCR 标签
just manifest-bake agent   # 输出解析后的 GHCR 专用 Bake JSON
just readme                # 重新生成中英文镜像索引
just dfcli scan             # 列出已跟踪的 Bake 镜像组
```

目录中的 Makefile 提供构建变量和准备步骤。可复用的 just 任务位于 [`just/`](just/)，镜像目录的 justfile 导入共享任务，并根据共享文件的位置解析仓库根目录。根目录和镜像目录的命令都通过 Make 与 `build.mk` 执行，保留仓库 Docker 配置。仅有 Bake 的目录使用 `build.mk` 作为 Makefile。

```bash
just print nginx           # 通过目录 Makefile 解析 Bake JSON
just build nginx           # 构建并加载本机架构镜像
just push nginx --dry-run  # 预览 Make 命令，不执行构建或发布

cd php
just print 82              # PHP 8.2 的历史基础镜像
just build 83              # 构建并加载 PHP 8.3
just push --dry-run 83     # 预览 PHP 8.3 发布命令
# just push 83             # 发布已配置的 Docker Hub/Quay 标签
```

存在镜像专用 Make 任务时，优先使用 `image-build`、`image-load`、`image-push` 和 `image-ls`，保留应用构建等前置步骤。自定义任务需使用 `$(DOCKER_BUILD_BAKE)` 接收显式 target 与构建/加载选项；需要这些参数但任务尚未适配时，会在执行前报错。

共享设置启用变量惰性求值，未指定任务时列出可用任务。`just check` 并行执行类型检查、测试、manifest 校验、两份 README 检查，以及 justfile 语法和格式检查。`just just-fmt` 格式化所有已跟踪的 justfile 与共享文件。

`just bake` 仅构建，`just build` 与 `just load` 加载本机平台。这些任务与 `just push` 均支持 `--dry-run` 预览 Make 命令。本地发布通过共享 CLI 调用 `make push`，等价的 Make 命令如下：

```bash
# 查看某个镜像组解析后的 Bake 配置
cd gitea-runner
make -s print

# 构建并推送该镜像组配置的标签
DOCKER_BUILD_PROGRESS=plain make push
```

## GitHub Actions

| 工作流 | 触发条件 | 行为 |
|---|---|---|
| [CI](.github/workflows/ci.yml) | Pull request 和推送到 `master` | 类型检查、测试、manifest 校验、README 生成区块与 justfile 检查，以及受管理 Bake target 的解析 |
| [Publish GHCR](.github/workflows/ghcr.yml) | `master` 上的 `manifest.yaml` 或发布工作流变更；手动触发 | 按依赖顺序构建 GHCR 上缺失的 canonical 标签，跳过已有标签 |

手动发布支持镜像选择器、平台覆盖和 dry-run。Docker Hub 与 Quay 的发布使用各镜像目录中的本地 `make push` 命令。

## 版本维护

受 manifest 管理的变体通过 `version` 字段确定 canonical 标签：

| 策略 | 版本字段 | 示例 |
|---|---|---|
| `alpine` | Alpine 发行版本和 revision | `3.24.1-r0` |
| `app` | 应用版本和 revision | `5.0.7-r0` |
| `app-alpine` | 应用版本、Alpine 发行版本和 revision | `24.17.0-alpine-3.24.1-r0` |

Alpine 版本可以从内部基础变体继承。`just plan` 计算构建顺序，下游 revision 显式维护。

`just manifest-bake <image>` 将 manifest 版本、canonical GHCR 标签、OCI labels 和父镜像 contexts 解析为 Bake JSON，仅输出配置。Bake 与 Make 的默认值仍单独维护。`just status` 中的 `BAKE TAG=generated` 表示 canonical 标签由生成配置提供，`native` 表示该目录的 Bake 配置已声明此标签。

受管理的应用版本可以包含 Alpine 包修订，例如 `1.30.4-r1`。PHP 8.2 使用固定 digest 的历史 nginx 镜像，基于 Alpine 3.19.1；PHP 8.3 和 8.4 使用基于 Alpine 3.24.1 的受管理 nginx 变体。各 PHP 变体独立维护应用版本、Alpine 版本和构建 revision。旧 target `7`、`81`、`8` 和 `7-composer` 不参与自动发布，PHP 8.1 的手动 target 同样使用 Alpine 3.19.1。

`just plan php` 与 `just publish-plan php` 选择全部受管理的 PHP 变体。要求单个 target 的命令使用显式选择器，例如 `just manifest-bake php.8.2`。

尚未纳入 manifest 的镜像组通过维护命令更新 Bake 中的 revision 默认值：

```bash
# 预览或写入下一个 revision
just dfcli rev bump postgres
just dfcli rev bump postgres --write

# 记录上游基础镜像 digest，已有 digest 变化时递增 revision
just dfcli base check postgres --write
just dfcli base check postgres --write --bump

# 比较 PostgreSQL 扩展与上游版本
just postgres-versions
```

`base check` 将上游镜像 digest 保存在 `.github/image-base-digests.json`。首次观察建立基线，后续 digest 发生变化时可以通过 `--bump` 递增 revision。

## 构建信息

- 大多数镜像组面向 `linux/amd64` 和 `linux/arm64`，平台列表由各 Bake target 定义。
- 部分 Bake target 通过命名 `contexts` 将父镜像映射到 Quay。
- GHCR 发布使用仓库的 GitHub Actions token，并记录 OCI source、version 和 revision 元数据。
