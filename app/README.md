# Application Container

```bash
# Start a app server
docker run --rm -it \
    -v $HOME/.ssh/authorized_keys:/home/admin/.ssh/authorized_keys \
    --name app wener/app

ssh admin@10.10.0.139 -o StrictHostKeyChecking=no
```
