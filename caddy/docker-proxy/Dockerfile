# https://github.com/lucaslorentz/caddy-docker-proxy/blob/master/Dockerfile-alpine

ARG VERSION=2.8.4
FROM caddy:${VERSION}-builder AS builder

RUN xcaddy build \
    --with github.com/lucaslorentz/caddy-docker-proxy/v2 \
    --with github.com/caddy-dns/acmedns

FROM wener/base

COPY --from=builder /usr/bin/caddy /usr/bin/caddy

CMD ["/usr/sbin/caddy","run","--adapter","caddyfile","--config","/etc/caddy/Caddyfile"]
