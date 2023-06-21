# sni-rev-proxy

```bash
# --network=host or -p 80:80 -p 443:443 -p 53:53/udp
docker run --rm -it -e PROXY=socks5://192.168.66.1:7890 -p 80:80 -p 443:443 -p 53:53/udp --name proxy wener/sni-rev-proxy
```

| env    | default    |
|--------|------------|
| PROXY  |            |
| FAKEIP | 172.32.1.1 |

- https://wener.me/story/sni-proxy
