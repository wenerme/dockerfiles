# AutoSSH

Forward google public tcp dns to local

```yaml
forward:
  image: 'wener/autossh'
  restart: always
  environment:
    - SSHPASS=PASSWORD_HERE
    - SSH_COMMANDS=-vtCN -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o ExitOnForwardFailure=yes -L :53:8.8.8.8:53 USER@HOST
  expose:
    - 53/tcp
```

```bash
# Or use ssh with restart

# connection test
docker run -it --rm -v $HOME/.ssh/:/root/.ssh wener/autossh ssh root@172.17.0.1
# forward dns
docker run -d --restart always -v $HOME/.ssh/:/root/.ssh/ wener/autossh -vNL :53:8.8.8.8:53 user@hosh
# socks
docker run -d --restart always -p 10.10.0.100:8888:8888 --name socks -v $HOME/.ssh/:/root/.ssh wener/autossh -vgND 8888 -o StrictHostKeyChecking=no -o ExitOnForwardFailure=yes root@172.17.0.1
```
