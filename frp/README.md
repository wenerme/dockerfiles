# frp

```bash
docker run --rm -it \
  -v $PWD/frps.ini:/etc/frp/frps.ini \
  --name frps wener/frp:frps

docker run --rm -it \
-v $PWD/frpc.ini:/etc/frp/frpc.ini \
--name frpc wener/frp:frpc
```
