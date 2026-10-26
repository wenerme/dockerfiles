# frp

[frp](https://github.com/fatedier/frp) release binaries on Alpine, for amd64 and arm64.

| Image | Default command |
|---|---|
| `frp` | none; contains `frpc` and `frps` |
| `frpc` | `frpc -c /etc/frp/frpc.yaml` |
| `frps` | `frps -c /etc/frp/frps.yaml` |

Tags: `latest`, `<version>` (e.g. `0.71.1`) and `<version>-alpine-<alpine>-r<N>`.

```bash
docker run --rm -it -v $PWD/frps.yaml:/etc/frp/frps.yaml --name frps ghcr.io/wenerme/dockerfiles/frps
docker run --rm -it -v $PWD/frpc.yaml:/etc/frp/frpc.yaml --name frpc ghcr.io/wenerme/dockerfiles/frpc
```

The sample `frpc.toml` and `frps.toml` from the release are in `/etc/frp`.
