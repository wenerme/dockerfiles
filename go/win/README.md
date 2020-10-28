# wener/go:win

Golang 交叉编译 Windows

```bash
docker run --rm -it \
    -e GO111MODULE=on -e GOPROXY=https://goproxy.io \
    -v $HOME/go:/root/go \
    --workdir /root/$(realpath --relative-to="$HOME" "$PWD") \
    --name go wener/go bash
```
