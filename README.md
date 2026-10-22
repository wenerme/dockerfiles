# Dockerfiles

English | [Chinese](README.zh-CN.md)

Container image definitions, build configuration, and release tooling maintained by Wener. Most images use Alpine Linux.

## Registries

Registry namespaces vary by image family:

- Docker Hub: `docker.io/wener/<image>:<tag>`
- Quay: `quay.io/wener/<image>:<tag>`
- GHCR: `ghcr.io/wenerme/dockerfiles/<image>:<tag>`

[manifest.yaml](manifest.yaml) defines versions and build dependencies for the GHCR publishing workflow. Other Bake image groups use the configuration in their respective directories. `just status --remote` reports the managed variants and their GHCR publication status.

## Tags

| Pattern | Meaning | Example |
|---|---|---|
| `latest` | Moving tag for the default variant, where published | `latest` |
| `<version>` | Upstream application or runtime version | `24.17.0` |
| `<version>-r<N>` | Build revision for an upstream version | `5.0.7-r0` |
| `<version>-alpine-<alpine>-r<N>` | Application version, Alpine release, and build revision | `24.17.0-alpine-3.24.1-r0` |

Manifest variants use a canonical tag ending in `-r<N>`. Nondefault variants add a `<variant>-` prefix, for example `openrc-3.24.1-r0`. Existing canonical tags are skipped by the publishing workflow; a new build requires a version or revision change.

## Image Index

The index is generated from `manifest.yaml` and Git-tracked Bake configuration. `just readme` updates the generated sections in both language versions; text outside the markers is maintained manually.

<!-- BEGIN GENERATED IMAGES -->

### Manifest Release Targets

Desired versions from `manifest.yaml`. Publication status is available through `just status --remote`.

| Variant | Build | Version scheme | Target version | Alpine | Base | GHCR canonical ref |
|---|---|---|---|---|---|---|
| `base.default` | [base/base](base/base/) · `base` | alpine | `3.24.2-r1` | 3.24.2 | `scratch / Alpine minirootfs` | `ghcr.io/wenerme/dockerfiles/base:3.24.2-r1` |
| `agent.default` | [agent](agent/) · `agent` | alpine | `3.24.2-r1` | 3.24.2 | `base.default` | `ghcr.io/wenerme/dockerfiles/agent:3.24.2-r1` |
| `pdns.default` | [pdns](pdns/) · `pdns` | app | `5.0.7-r2` | 3.24.2 | `base.default` | `ghcr.io/wenerme/dockerfiles/pdns:5.0.7-r2` |
| `node-builder.default` | [node-builder](node-builder/) · `node-builder` | app-alpine | `24.17.0-alpine-3.24.2-r1` | 3.24.2 | `base.default` | `ghcr.io/wenerme/dockerfiles/node-builder:24.17.0-alpine-3.24.2-r1` |
| `go-builder.default` | [go-builder](go-builder/) · `go-builder` | app-alpine | `1.26.3-r0-alpine-3.24.1-r0` | 3.24.1 | `quay.io/wener/go:1.26.3-r0-alpine-3.24.1-r0@sha256:e2abf60cd8c81a1705edd458c81047ceda81349ec06d90149058b5053a7a7350` | `ghcr.io/wenerme/dockerfiles/go-builder:1.26.3-r0-alpine-3.24.1-r0` |
| `nginx.default` | [nginx](nginx/) · `nginx` | app-alpine | `1.30.4-r1-alpine-3.24.2-r1` | 3.24.2 | `base.default` | `ghcr.io/wenerme/dockerfiles/nginx:1.30.4-r1-alpine-3.24.2-r1` |
| `php.8.2` | [php](php/) · `82` | app-alpine | `8.2-8.2.26-r0-alpine-3.19.1-r0` | 3.19.1 | `quay.io/wener/nginx:alpine-3.19.1@sha256:1da7b7845bed8cc54efb93d7289cb89c2bf87656159258a51ed7c0c3e1c449a5` | `ghcr.io/wenerme/dockerfiles/php:8.2-8.2.26-r0-alpine-3.19.1-r0` |
| `php.8.3` | [php](php/) · `83` | app-alpine | `8.3-8.3.36-r0-alpine-3.24.2-r0` | 3.24.2 | `nginx.default` | `ghcr.io/wenerme/dockerfiles/php:8.3-8.3.36-r0-alpine-3.24.2-r0` |
| `php.8.4` | [php](php/) · `84` | app-alpine | `8.4-8.4.27-r0-alpine-3.24.2-r0` | 3.24.2 | `nginx.default` | `ghcr.io/wenerme/dockerfiles/php:8.4-8.4.27-r0-alpine-3.24.2-r0` |
| `php.8.5` | [php](php/) · `85` | app-alpine | `8.5-8.5.12-r0-alpine-3.24.2-r0` | 3.24.2 | `nginx.default` | `ghcr.io/wenerme/dockerfiles/php:8.5-8.5.12-r0-alpine-3.24.2-r0` |

### Additional Bake Image Groups

40 tracked Bake groups and 10 manifest variants. The 33 groups below are not managed by the manifest. Variants lists nondefault Bake targets; Base lists parent image repositories.

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

## Development

Requirements: Bun, [just](https://github.com/casey/just) 1.58.0 or newer, and Docker with the Buildx plugin. The Bun version is declared in `package.json`; `just/common.just` enforces the minimum just version.

Repository tooling is provided by `dfcli`, a commander CLI at `scripts/dfcli/main.ts`. `just` lists available recipes; `just dfcli --help` lists CLI commands.

```bash
bun install --frozen-lockfile
just --jobs 3 check        # Run independent checks in parallel, with at most three recipes
just status                # Manifest variants and Bake target validation
just status --remote       # Include GHCR publication status
just plan base             # Build order for affected variants and their prerequisites
just publish-plan          # Preview which GHCR tags would be built
just manifest-bake agent   # Print resolved GHCR-only Bake JSON
just readme                # Regenerate the English and Chinese image indexes
just dfcli scan             # List tracked Bake image groups
```

Directory Makefiles supply build variables and preparation steps. Reusable just recipes live in [`just/`](just/); image-directory justfiles import them and resolve the repository root from the shared file's location. Both root and directory commands run through Make and `build.mk`, including the repository Docker configuration. Bake-only directories use `build.mk` as their Makefile.

```bash
just print nginx           # Resolved Bake JSON from the directory Makefile
just build nginx           # Build and load for the local architecture
just push nginx --dry-run  # Preview Make commands without building or publishing

cd php
just print 82              # Historical PHP 8.2 base
just build 83              # Build and load PHP 8.3
just push --dry-run 83     # Preview the PHP 8.3 publishing command
# just push 83             # Publish configured Docker Hub/Quay tags
```

Image-specific Make goals (`image-build`, `image-load`, `image-push`, and `image-ls`) take precedence when present, preserving application preparation steps. Custom recipes must use `$(DOCKER_BUILD_BAKE)` to receive explicit targets and build/load options. Unsupported custom recipes fail before execution when those options are required.

Shared settings enable lazy variable evaluation and list recipes when no recipe is selected. `just check` runs typechecking, tests, manifest validation, both README checks, and justfile syntax and formatting checks in parallel. `just just-fmt` formats all tracked justfiles and shared imports.

`just bake` builds without loading; `just build` and `just load` load the local platform. Their `--dry-run` option, also available on `just push`, previews Make commands. Local publishing uses `make push` through the shared CLI. The equivalent Make commands are:

```bash
# Inspect the resolved Bake configuration for an image group
cd gitea-runner
make -s print

# Build and push the tags configured for that group
DOCKER_BUILD_PROGRESS=plain make push
```

## GitHub Actions

| Workflow | Trigger | Behavior |
|---|---|---|
| [CI](.github/workflows/ci.yml) | Pull requests and pushes to `master` | Typecheck, tests, manifest validation, generated README and justfile checks, and managed Bake target resolution |
| [Publish GHCR](.github/workflows/ghcr.yml) | Changes to `manifest.yaml` or the publishing workflow on `master`; manual dispatch | Build missing canonical GHCR tags in dependency order and skip existing tags |
| [Publish GHCR](.github/workflows/ghcr.yml) (verify) | Pull requests changing `manifest.yaml`, the publishing workflow, or `scripts/dfcli` | Build the same missing tags and push them only to a local registry on the runner; dependents use the parents built in the same run |

Version changes go through a pull request: the verify run builds every missing tag, and merging to `master` publishes them. Each publish also repoints the variant's aliases, such as `php:8.4`, to its canonical tag. Manual publishing accepts image selectors, a platform override, and a dry-run option.

`just mirror <image> --to docker.io/wener` previews copying the published GHCR canonical and alias tags to Docker Hub or Quay without rebuilding; `--push` writes them using the repository Docker configuration. Images outside the manifest use each image directory's local `make push` command.

## Version Maintenance

For manifest-managed variants, the `version` fields determine the canonical tag:

| Scheme | Version fields | Example |
|---|---|---|
| `alpine` | Alpine release and revision | `3.24.1-r0` |
| `app` | Application version and revision | `5.0.7-r0` |
| `app-alpine` | Application version, Alpine release, and revision | `24.17.0-alpine-3.24.1-r0` |

Alpine versions can be inherited from an internal base variant. `just plan` calculates the build order.

`just alpine-update` reads `alpinelinux.org/releases.json` and previews moving each explicit Alpine version to the newest patch on its branch; `just alpine-update --write` applies it to `manifest.yaml` and the README regions. Revisions are propagated along the dependency graph: a variant whose canonical tag changes starts at `r0`, and a variant whose parent changed under an unchanged tag, such as `pdns`, gets its revision incremented. Variants pinned to an external parent image and newer Alpine branches are reported but not changed.

`just bump <image>` increments a variant's revision and propagates it to every dependent; use it when content changes without a version change. The base image runs `apk upgrade` during its build, so `just bump base --write` picks up Alpine security fixes released after the minirootfs.

`aliases` in a variant declare moving tags, such as `"8.4"` or `"8.4-alpine-${alpine}"`. They are applied after the canonical tag is published and must not end in `-rN`, which is reserved for canonical tags.

`just manifest-bake <image>` resolves manifest versions, the canonical GHCR tag, OCI labels, and parent image contexts into Bake JSON. It prints configuration without building. Bake and Make defaults remain independently maintained. In `just status`, `BAKE TAG=generated` means the canonical tag is supplied by generated configuration; `native` means the directory's Bake configuration already declares it.

Managed application versions can include an Alpine package revision, such as `1.30.4-r1`. PHP 8.2 uses a pinned historical nginx image on Alpine 3.19.1 and is not actively maintained. PHP 8.3, 8.4, and 8.5 inherit Alpine from base through the managed nginx variant. Each PHP variant has its own version and build revision, and the aliases `<major.minor>` and `<major.minor>-alpine-<alpine>` follow its latest canonical tag. Legacy targets `7`, `81`, `8`, and `7-composer` remain outside automatic publishing. PHP 8.1's manual target also uses Alpine 3.19.1.

`just plan php` and `just publish-plan php` select all managed PHP variants. Commands requiring one target, such as `just manifest-bake php.8.2`, use an explicit variant selector.

For image groups outside the manifest, the maintenance commands update their Bake revision defaults:

```bash
# Preview or write the next revision
just dfcli rev bump postgres
just dfcli rev bump postgres --write

# Record upstream base digests; bump when a recorded digest changes
just dfcli base check postgres --write
just dfcli base check postgres --write --bump

# Compare PostgreSQL extension versions with upstream
just postgres-versions
```

`base check` stores upstream image digests in `.github/image-base-digests.json`. The first observation establishes a baseline; later digest changes can trigger a revision bump with `--bump`.

## Build Details

- Most image groups target `linux/amd64` and `linux/arm64`; platform lists are defined by their Bake targets.
- Some Bake targets map parent images to Quay through named `contexts`.
- GHCR publishing uses the repository's GitHub Actions token and records OCI source, version, and revision metadata.
