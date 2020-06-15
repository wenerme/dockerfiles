## wener/tinc

tinc in docker container

```bash
# join generate config
docker run --it --rm \
  --cap-add=NET_ADMIN --device=/dev/net/tun \
  -v $PWD/tinc:/etc/tinc \
  --name tinc wener/tinc tinc join xxxxx

# start you net
docker run -d --restart always  \
  --cap-add=NET_ADMIN --device=/dev/net/tun \
  -v $PWD/tinc:/etc/tinc \
  --name tinc wener/tinc tinc start -Dd 5
```
