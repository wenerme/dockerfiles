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
