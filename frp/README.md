# frp

```bash
docker run --rm -it \
  -v $PWD/frps.yaml:/etc/frp/frps.yaml \
  --name frps wener/frp:frps

docker run --rm -it \
-v $PWD/frpc.yaml:/etc/frp/frpc.yaml \
--name frpc wener/frp:frpc
```
