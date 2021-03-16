# wener/samba

```bash
docker run --rm -it \
  -p 139:139 -p 139:139/udp -p 445:445 \
  -v $PWD:/share \
  --name samba wener/samba

# debug
docker run --rm -it \
  -p 139:139 -p 139:139/udp -p 445:445 \
  -v $PWD:/share -w /share \
  --name samba wener/samba bash
```
