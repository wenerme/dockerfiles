
<!-- lang:zh -->

# wener/proxy

快速代理容器，通过启动的主机进行代理。

* 7777 - http 代理
* 8888 - socks 代理

```bash
docker run --rm -it \
  -p 10.10.0.1:7777:7777 \
  -p 10.10.0.1:8888:8888 \
  --name proxy wener/proxy
```
