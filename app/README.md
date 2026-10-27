# Application Container

OpenRC-based Alpine images, each built on the previous one, for amd64 and arm64:

| Image | Tags | Adds |
|---|---|---|
| `app` | `latest`, `<alpine>`, `<alpine>-r<N>` | syslog, crond, local services; `admin` user with sudo/doas |
| `app:ssh` | `ssh`, `<alpine>-ssh`, `ssh-<alpine>-r<N>` | sshd, python3 |
| `app:workspace` | `workspace`, `<alpine>-workspace`, `workspace-<alpine>-r<N>` | development tools and coding agents |

```bash
# Start a app server
docker run --rm -it \
    -v $HOME/.ssh/authorized_keys:/home/admin/.ssh/authorized_keys \
    --name app ghcr.io/wenerme/dockerfiles/app:ssh

ssh admin@10.10.0.139 -o StrictHostKeyChecking=no
```
