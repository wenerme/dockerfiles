ARG VERSION=2.8.4
ARG ALPINE_RELEASE=3.20.3

FROM caddy:${VERSION}-builder AS builder

# https://caddyserver.com/docs/modules/
RUN --mount=type=cache,target=/root/go \
    xcaddy build \
    --with github.com/caddy-dns/acmedns \
    --with github.com/caddy-dns/powerdns \
    --with github.com/caddy-dns/cloudflare \
    --with github.com/caddy-dns/linode \
    --with github.com/caddy-dns/alidns \
    --with github.com/darkweak/souin/plugins/caddy \
    --with github.com/darkweak/storages/badger/caddy \
    --with github.com/darkweak/storages/redis/caddy \
    --with github.com/lucaslorentz/caddy-docker-proxy/v2 \
    --with github.com/mholt/caddy-dynamicdns \
    --with github.com/mholt/caddy-l4 \
    --with github.com/mholt/caddy-ratelimit \
    --with github.com/mholt/caddy-webdav \
    --with github.com/sagikazarmark/caddy-fs-s3 \
    --with github.com/yroc92/postgres-storage

FROM wener/base:${ALPINE_RELEASE}

LABEL org.label-schema.name="caddy" \
    org.label-schema.description="Caddy based on Alpine Linux"

# RUN apk add --no-cache caddy
COPY --from=builder /usr/bin/caddy /usr/bin/caddy
COPY rootfs /
EXPOSE 80 443 2015

CMD ["/usr/bin/caddy","run","--adapter","caddyfile","--config","/etc/caddy/Caddyfile"]
