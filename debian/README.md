# Debian

Debian images with apt pointed at the TUNA mirror (`https://mirrors.tuna.tsinghua.edu.cn`) and backports enabled.

| Tag | Debian |
|---|---|
| `13`, `trixie`, `latest`, `13.<point>-r<N>` | 13 trixie (stable) |
| `12`, `bookworm`, `bookworm-12.<point>-r<N>` | 12 bookworm (oldstable) |

```bash
docker run --rm -it ghcr.io/wenerme/dockerfiles/debian:13
apt-get update && apt-get install -t trixie-backports <package>
```

The former `wener/debian:bookworm-backports` image (amd64 only) is no longer built; use `bookworm` or `12`, which have backports enabled and include arm64.

Packages are installed and upgraded from `deb.debian.org` during the build; only the final apt configuration uses the mirror. To use another mirror, rewrite the `URIs:` lines in `/etc/apt/sources.list.d/debian.sources`.
