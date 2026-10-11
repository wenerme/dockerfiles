import 'common.just'

# Build and load one platform locally through Make.
[arg('dry_run', long='dry-run', value='true', help='Preview Make commands without executing them')]
[group('project')]
[positional-arguments]
build dry_run='false' *target:
    shift; bun {{ quote(_repo_root / 'scripts/dfcli/main.ts') }} project load {{ quote(justfile_directory()) }} {{ if dry_run == 'true' { '--dry-run' } else { '' } }} -- "$@"

# Load one platform into the local image store.
[arg('dry_run', long='dry-run', value='true', help='Preview Make commands without executing them')]
[group('project')]
[positional-arguments]
load dry_run='false' *target:
    shift; bun {{ quote(_repo_root / 'scripts/dfcli/main.ts') }} project load {{ quote(justfile_directory()) }} {{ if dry_run == 'true' { '--dry-run' } else { '' } }} -- "$@"

# Build through Make and Bake without loading or publishing.
[arg('dry_run', long='dry-run', value='true', help='Preview Make commands without executing them')]
[group('project')]
[positional-arguments]
bake dry_run='false' *target:
    shift; bun {{ quote(_repo_root / 'scripts/dfcli/main.ts') }} project build {{ quote(justfile_directory()) }} {{ if dry_run == 'true' { '--dry-run' } else { '' } }} -- "$@"

# Publish through the project's Make workflow.
[arg('dry_run', long='dry-run', value='true', help='Preview Make commands without executing them')]
[group('project')]
[positional-arguments]
push dry_run='false' *target:
    shift; bun {{ quote(_repo_root / 'scripts/dfcli/main.ts') }} project push {{ quote(justfile_directory()) }} {{ if dry_run == 'true' { '--dry-run' } else { '' } }} -- "$@"

# Print the Bake plan as JSON.
[group('project')]
[positional-arguments]
print *target:
    bun {{ quote(_repo_root / 'scripts/dfcli/main.ts') }} project print {{ quote(justfile_directory()) }} -- "$@"

# Show project information through Make.
[group('project')]
[positional-arguments]
info *target:
    bun {{ quote(_repo_root / 'scripts/dfcli/main.ts') }} project info {{ quote(justfile_directory()) }} -- "$@"
