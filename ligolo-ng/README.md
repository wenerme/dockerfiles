# wener/ligolo-ng

Ligolo-ng agent/proxy image based on `wener/base`.

Default entrypoint is `ligolo-ng-agent`.

## Agent on pivot host

```bash
docker run -d \
  --name ligolo-agent \
  --restart unless-stopped \
  --network host \
  wener/ligolo-ng:0.8.3 \
  -connect 10.166.6.102:11601 \
  -accept-fingerprint <FINGERPRINT> \
  -retry \
  -reconnect
```

For quick PoC only:

```bash
docker run --rm --network host wener/ligolo-ng:0.8.3 \
  -connect 10.166.6.102:11601 -ignore-cert -retry -reconnect
```

## Proxy binary

The image also contains `ligolo-ng-proxy`:

```bash
docker run --rm wener/ligolo-ng:0.8.3 ligolo-ng-agent -version
docker run --rm --entrypoint /usr/local/bin/ligolo-ng-proxy wener/ligolo-ng:0.8.3 -version
```

Proxy TUN mode still needs NET_ADMIN and `/dev/net/tun` when run in Linux containers.
