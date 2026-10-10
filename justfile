import? 'local.just'
import 'base.just'

[private]
default:
    @just --list --justfile {{ justfile() }}

# Format justfile
[group('just')]
just-fmt:
    just --fmt --unstable

# List all projects with docker-bake.hcl
[group('project')]
list:
    #!/usr/bin/env bash
    set -euo pipefail
    for f in $(find . -name docker-bake.hcl -not -path './.docker/*' | sort); do
        dir=$(dirname "$f")
        dir=${dir#./}
        echo "$dir"
    done

# Build a project (load locally): just build caddy
[group('project')]
build project *target:
    cd {{project}} && docker buildx bake --load {{target}}

# Push a project: just push caddy
[group('project')]
push project *target:
    cd {{project}} && docker buildx bake --push {{target}}

# Print bake plan for a project: just print caddy
[group('project')]
print project *target:
    cd {{project}} && docker buildx bake --print {{target}}

# Setup docker buildx multiarch builder
[group('docker')]
docker-setup:
    mkdir -p .docker
    ln -fs ~/.docker/buildx/ .docker/buildx
    ln -fs ~/.docker/contexts/ .docker/contexts
    ln -fs ~/.docker/cli-plugins/ .docker/cli-plugins
    DOCKER_CONFIG={{justfile_directory()}}/.docker docker buildx use multiarch-builder

# Typecheck, test, validate manifest and README (same as CI)
[group('manifest')]
check:
    bun run typecheck
    bun run test
    bun scripts/dockerfiles.ts manifest:check
    bun scripts/dockerfiles.ts readme --check

# Show manifest variants; add --remote to query GHCR
[group('manifest')]
status *args:
    bun scripts/dockerfiles.ts status {{args}}

# Dependency-ordered build plan: just plan base
[group('manifest')]
plan *images:
    bun scripts/dockerfiles.ts plan {{images}}

# Print the manifest dependency graph as Mermaid
[group('manifest')]
graph:
    bun scripts/dockerfiles.ts graph

# Regenerate the README generated region
[group('manifest')]
readme:
    bun scripts/dockerfiles.ts readme

# Print the GHCR-only Bake JSON for one variant: just manifest-bake agent
[group('manifest')]
manifest-bake image:
    bun scripts/dockerfiles.ts manifest:bake {{image}}

# Preview which GHCR tags would be built (publishing itself runs in CI)
[group('manifest')]
publish-plan *images:
    bun scripts/dockerfiles.ts publish {{images}}

# Compare postgres extension versions with upstream
[group('project')]
postgres-versions:
    bun scripts/scan-postgres-versions.ts
