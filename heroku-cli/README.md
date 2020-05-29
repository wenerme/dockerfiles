# wener/heroku-cli

Minimal image with heroku cli

```bash
docker run --rm -it \
    -e env HEROKU_API_KEY=my-token \
    -e HEROKU_APP=myapp \
    wener/heroku-cli

heroku ps
```

# wener/heroku-cli:docker

Add docker, fot heroku container command.

```bash
# login to registry
heroku container:login
# build Dockerfile and push to registry
heroku container:push web
```
