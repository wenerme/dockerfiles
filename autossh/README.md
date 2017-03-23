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
docker run -d --restart always -v $HOME/.ssh/:/root/.ssh/ ssh -vNL :53:8.8.8.8:53 user@hosh
```
