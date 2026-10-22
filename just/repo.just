import 'common.just'

# Format all tracked justfiles and shared imports.
[group('just')]
[script('bash')]
just-fmt:
    set -euo pipefail
    while IFS= read -r -d '' file; do
        just --justfile "{{ _repo_root }}/$file" --fmt
    done < <(git -C {{ quote(_repo_root) }} ls-files -z -- justfile '**/justfile' 'just/*.just')

# Validate syntax and formatting for every tracked justfile and shared import.
[group('just')]
[script('bash')]
just-check:
    set -euo pipefail
    while IFS= read -r -d '' file; do
        just --justfile "{{ _repo_root }}/$file" --fmt --check
    done < <(git -C {{ quote(_repo_root) }} ls-files -z -- justfile '**/justfile' 'just/*.just')

# List tracked project directories containing docker-bake.hcl.
[group('project')]
list:
    @git -C {{ quote(_repo_root) }} ls-files -z -- docker-bake.hcl '**/docker-bake.hcl' | python3 -c 'import os, sys; paths = sys.stdin.buffer.read().split(b"\0"); print("\n".join(sorted({os.path.dirname(os.fsdecode(p)) or "." for p in paths if p})))'

# Build and load a project locally: just build caddy.
[arg('dry_run', long='dry-run', value='true', help='Preview Make commands without executing them')]
[group('project')]
[positional-arguments]
build project dry_run='false' *target:
    directory="$1"; shift 2; bun {{ quote(_repo_root / 'scripts/dfcli/main.ts') }} project load "$directory" {{ if dry_run == 'true' { '--dry-run' } else { '' } }} -- "$@"

# Load one platform into the local image store.
[arg('dry_run', long='dry-run', value='true', help='Preview Make commands without executing them')]
[group('project')]
[positional-arguments]
load project dry_run='false' *target:
    directory="$1"; shift 2; bun {{ quote(_repo_root / 'scripts/dfcli/main.ts') }} project load "$directory" {{ if dry_run == 'true' { '--dry-run' } else { '' } }} -- "$@"

# Build through Make and Bake without loading or publishing.
[arg('dry_run', long='dry-run', value='true', help='Preview Make commands without executing them')]
[group('project')]
[positional-arguments]
bake project dry_run='false' *target:
    directory="$1"; shift 2; bun {{ quote(_repo_root / 'scripts/dfcli/main.ts') }} project build "$directory" {{ if dry_run == 'true' { '--dry-run' } else { '' } }} -- "$@"

# Publish a project through its Make workflow.
[arg('dry_run', long='dry-run', value='true', help='Preview Make commands without executing them')]
[group('project')]
[positional-arguments]
push project dry_run='false' *target:
    directory="$1"; shift 2; bun {{ quote(_repo_root / 'scripts/dfcli/main.ts') }} project push "$directory" {{ if dry_run == 'true' { '--dry-run' } else { '' } }} -- "$@"

# Print the project's Bake plan as JSON.
[group('project')]
[positional-arguments]
print project *target:
    directory="$1"; shift; bun {{ quote(_repo_root / 'scripts/dfcli/main.ts') }} project print "$directory" -- "$@"

# Show project information through Make.
[group('project')]
[positional-arguments]
info project *target:
    directory="$1"; shift; bun {{ quote(_repo_root / 'scripts/dfcli/main.ts') }} project info "$directory" -- "$@"

# Configure the multiarch builder using the repository's Docker config.
[group('docker')]
docker-setup:
    mkdir -p {{ quote(_repo_root / '.docker') }}
    ln -fs "$HOME/.docker/buildx/" {{ quote(_repo_root / '.docker/buildx') }}
    ln -fs "$HOME/.docker/contexts/" {{ quote(_repo_root / '.docker/contexts') }}
    ln -fs "$HOME/.docker/cli-plugins/" {{ quote(_repo_root / '.docker/cli-plugins') }}
    DOCKER_CONFIG={{ quote(_repo_root / '.docker') }} docker buildx use multiarch-builder

# Run independent repository checks concurrently; limit concurrency with --jobs.
[group('manifest')]
[parallel]
check: typecheck test manifest-check readme-check just-check

# Check TypeScript sources.
[group('check')]
typecheck:
    bun run typecheck

# Run the repository test suite.
[group('check')]
test:
    bun run test

# Validate manifest metadata and dependency resolution.
[group('check')]
manifest-check:
    bun {{ quote(_repo_root / 'scripts/dfcli/main.ts') }} manifest check

# Check both generated README regions.
[group('check')]
readme-check:
    bun {{ quote(_repo_root / 'scripts/dfcli/main.ts') }} readme --check

# Run any dfcli command: just dfcli --help.
[group('manifest')]
[positional-arguments]
dfcli *args:
    bun {{ quote(_repo_root / 'scripts/dfcli/main.ts') }} "$@"

# Show manifest variants; add --remote to query GHCR.
[group('manifest')]
[positional-arguments]
status *args:
    bun {{ quote(_repo_root / 'scripts/dfcli/main.ts') }} status "$@"

# Show a dependency-ordered build plan: just plan base.
[group('manifest')]
[positional-arguments]
plan *images:
    bun {{ quote(_repo_root / 'scripts/dfcli/main.ts') }} plan "$@"

# Print the manifest dependency graph as Mermaid.
[group('manifest')]
graph:
    bun {{ quote(_repo_root / 'scripts/dfcli/main.ts') }} graph

# Regenerate the English and Chinese README generated regions
[group('manifest')]
readme:
    bun {{ quote(_repo_root / 'scripts/dfcli/main.ts') }} readme

# Print the GHCR-only Bake JSON for one variant: just manifest-bake agent.
[group('manifest')]
[positional-arguments]
manifest-bake image:
    bun {{ quote(_repo_root / 'scripts/dfcli/main.ts') }} manifest bake "$@"

# Preview which GHCR tags would be built (publishing itself runs in CI).
[group('manifest')]
[positional-arguments]
publish-plan *images:
    bun {{ quote(_repo_root / 'scripts/dfcli/main.ts') }} publish "$@"

# Move manifest Alpine versions to the newest patch and propagate revisions: just alpine-update --write.
[group('manifest')]
[positional-arguments]
alpine-update *args:
    bun {{ quote(_repo_root / 'scripts/dfcli/main.ts') }} alpine update "$@"

# Bump a variant after a content change and propagate revisions to dependents: just bump base --write.
[group('manifest')]
[positional-arguments]
bump *args:
    bun {{ quote(_repo_root / 'scripts/dfcli/main.ts') }} manifest bump "$@"

# Copy published GHCR tags to another registry without rebuilding: just mirror php.8.4 --to docker.io/wener --push.
[group('manifest')]
[positional-arguments]
mirror *args:
    bun {{ quote(_repo_root / 'scripts/dfcli/main.ts') }} mirror "$@"

# Compare postgres extension versions with upstream.
[group('project')]
postgres-versions:
    bun {{ quote(_repo_root / 'scripts/dfcli/main.ts') }} postgres versions
