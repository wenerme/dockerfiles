# wener/apacheds

Apache Directory Server

```bash
docker run --rm -it -e TZ=Asia/Shanghai \
    -p 10389:10389 \
    -v $PWD/data:/opt/apacheds/instances \
    --name apacheds wener/apacheds
```

