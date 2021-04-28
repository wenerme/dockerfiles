# Golang

```bash
# use goer to replace go
alias goer='docker run --rm -v $HOME/go:/root/go --workdir /root/$(realpath --relative-to="$HOME" "$PWD") wener/go go'

# with https://goproxy.io
alias goer='docker run --rm -e GO111MODULE=on -e GOPROXY=https://goproxy.io -v $HOME/go:/root/go --workdir /root/$(realpath --relative-to="$HOME" "$PWD") wener/go go'

docker run --rm -it \
    -e GO111MODULE=on -e GOPROXY=https://goproxy.io \
    -v $HOME/go:/root/go \
    -v $HOME/.cache:/root/.cache \
    --workdir /root/$(realpath --relative-to="$HOME" "$PWD") \
    --name go wener/go bash

# 映射当前目录 - 现在已经不需要在 ~/go/src 下开发
docker run --rm -it \
    -e GO111MODULE=on -e GOPROXY=https://goproxy.io \
    -v $HOME/go:/root/go \
    -v $HOME/.cache:/root/.cache \
    -v $PWD:/host \
    --workdir /host \
    -u $(id -u) -e HOME=/root\
    --name go wener/go bash
```
