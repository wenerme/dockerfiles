import 'base.just'

[private]
default:
    @just --list --justfile {{ justfile() }}

# Format justfile
[group('just')]
just-fmt:
    just --fmt --unstable
