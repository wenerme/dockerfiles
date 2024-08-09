ARG VERSION=2.8.4
FROM caddy:${VERSION}-builder AS builder

RUN xcaddy build \
    --with github.com/lucaslorentz/caddy-docker-proxy/v2 \
    --with github.com/caddy-dns/acmedns \
    --with github.com/caddy-dns/powerdns \
    --with github.com/sagikazarmark/caddy-fs-s3

FROM caddy:${VERSION}-alpine

COPY --from=builder /usr/bin/caddy /usr/bin/caddy

COPY rootfs /

CMD ["/usr/sbin/caddy","run","--adapter","caddyfile","--config","/etc/caddy/Caddyfile"]
