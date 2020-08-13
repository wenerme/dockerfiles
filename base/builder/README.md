# Alpine Builder

```bash
# prepare
mkdir buiild && cd build
git clone --depth 50 https://gitlab.alpinelinux.org/alpine/aports

# cache installed apk and downloaded sources
docker run --rm -it \
    -v $PWD:/build \
    -v $PWD/distfiles:/var/cache/distfiles \
    -v $PWD/cache:/etc/apk/cache \
    --name builder wener/base:builder

sudo apk update
# generate keys
[ -e ~/.abuild ] || abuild-keygen -ani

cd aports/community/grpc
# -K keep the src and pkg
# -r Install missing deps
abuild -Kr
```
