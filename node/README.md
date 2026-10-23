# Node.js

Node.js from the official musl builds (`unofficial-builds.nodejs.org`) on Alpine, with npm, pnpm and yarn. Full ICU is included.

| Tag | Node.js |
|---|---|
| `26`, `latest`, `26.<minor>.<patch>` | 26 |
| `24`, `24.<minor>.<patch>` | 24 |

Headers are not included; node-gyp downloads them when a native addon is built. For builds, use [node-builder](../node-builder/).

The former `docker`, `tsx`, `nvm` and `n` variants and the Node 16/18/20 tags are no longer built.
