# wener/heroku-cli

Minimal image with heroku cli

```bash
docker run --rm -it \
    -e env HEROKU_API_KEY=my-token \
    -e HEROKU_APP=myapp \
    wener/heroku-cli

heroku ps
```
