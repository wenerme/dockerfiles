# Golang

```bash
# use goer to replace go
alias goer='docker run --rm -v $HOME/go:/root/go --workdir /root/$(realpath --relative-to="$HOME" "$PWD") wener/go go'

# with https://goproxy.io
alias goer='docker run --rm -e GO111MODULE=on -e GOPROXY=https://goproxy.io -v $HOME/go:/root/go --workdir /root/$(realpath --relative-to="$HOME" "$PWD") wener/go go'
```
