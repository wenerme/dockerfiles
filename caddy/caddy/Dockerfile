FROM wener/base
LABEL org.label-schema.name="caddy" \
    org.label-schema.description="Caddy based on Alpine Linux"

RUN apk add --no-cache caddy
COPY rootfs /
EXPOSE 80 443 2015

CMD ["/usr/sbin/caddy","run","--adapter","caddyfile","--config","/etc/caddy/Caddyfile"]
