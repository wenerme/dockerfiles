ARG VERSION=2.8.4
ARG ALPINE_RELEASE

FROM caddy:${VERSION}-builder AS builder

RUN xcaddy build \
    --with github.com/caddy-dns/acmedns \
    --with github.com/caddy-dns/powerdns

FROM wener/base:${ALPINE_RELEASE}

LABEL org.label-schema.name="caddy" \
    org.label-schema.description="Caddy based on Alpine Linux"

# RUN apk add --no-cache caddy
COPY --from=builder /usr/bin/caddy /usr/bin/caddy
COPY rootfs /
EXPOSE 80 443 2015

CMD ["/usr/bin/caddy","run","--adapter","caddyfile","--config","/etc/caddy/Caddyfile"]
