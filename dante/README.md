# wener/dante

Dante is a socks server and client implementation.

```bash
# default config allowed all access using 8888 port
docker run --rm -it \
    -p 8888:8888 \
    -v $PWD/sockd.conf:/etc/sockd.conf \
    --name dante wener/dante
```

