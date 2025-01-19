set dotenv-load := true

import? "{{justfile_directory()}}/pkg.just"
import? "{{justfile_directory()}}/local.just"

import? "{{invocation_directory()}}/pkg.just"
import? "{{invocation_directory()}}/local.just"

_bake:=path_exists(invocation_directory()+"/docker-bake.hcl")

export ALPINE_RELEASE := env("ALPINE_RELEASE", "3.21.2")

[private]
_default:
  @just --list --justfile {{ justfile() }}

# show info
[no-cd]
@info:
  echo "VERSION:         {{ env('VERSION', 'N/A') }}"
  echo "ALPINE_RELEASE:  $ALPINE_RELEASE"
  echo "ALPINE_VERSION:  $ALPINE_VERSION"
  echo "WORKDIR:         {{ invocation_directory() }}"
  echo "ROOTDIR:         {{ justfile_directory() }}"
  echo "tags: BAKE={{_bake}}"

# update .env
update:
  #!/usr/bin/env node
  import fs from 'fs/promises'
  const ALPINE_RELEASE = await fetch('https://alpinelinux.org/releases.json').then(res => res.json()).then(v=>v.release_branches[1].releases[0].version)
  const ALPINE_VERSION = ALPINE_RELEASE.split('.').slice(0, 2).join('.')
  const env = {
    ALPINE_RELEASE,
    ALPINE_VERSION
  }
  console.log(`Update alpine release to ${ALPINE_RELEASE}`)
  await fs.writeFile('.env', Object.entries(env).map(([k, v]) => `${k}=${v}`).join('\n'))

bake-push *target:
  docker buildx bake --push {{target}}

bake-print *target:
  docker buildx bake --print {{target}}
