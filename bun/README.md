# Bun

[Bun](https://bun.sh) on `wener/base` (Alpine), for amd64 and arm64. The binary is the musl build from the official `oven/bun:<version>-alpine` image; `bunx` is a symlink.

Tags: `latest`, `<version>` (e.g. `1.4.4`) and `<version>-alpine-<alpine>-r<N>`.

```bash
docker run --rm -it ghcr.io/wenerme/dockerfiles/bun bun --version
```

`node-builder` also includes bun for builds that need Node.js as well.
