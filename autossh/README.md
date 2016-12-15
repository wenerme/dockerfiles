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
