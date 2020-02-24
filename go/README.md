# Golang

```bash
# use goer to replace go
alias goer='docker run -v $HOME/go:/root/go --workdir /root/$(realpath --relative-to="$HOME" "$PWD") wener/go go'
```
