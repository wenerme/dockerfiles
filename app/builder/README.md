# Alpine Package Builder

```bash
# start build server
docker run -d --restart=unless-stopped \
    -p 2222:22 \
    -v $PWD:/build \
    -v $PWD/home:/home/admin \
    -v $PWD/distfiles:/var/cache/distfiles \
    -v $PWD/cache:/etc/apk/cache \
    --name build-server wener/app:builder

# clear last hostkey
ssh-keygen -R [127.0.0.1]:2222
# enter build server
# password admin
ssh admin@127.0.0.1 -p 2222

# 升级
docker run --rm -it -v /var/run/docker.sock:/var/run/docker.sock containrrr/watchtower -R build-server
```
