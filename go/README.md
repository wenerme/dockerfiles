# Golang

```bash
# use god to replace go
alias god="docker run -v $HOME/go:/root/go --workdir /root/$(realpath --relative-to="$HOME" "$PWD") wener/go"
```
