ARG ALPINE_RELEASE=3.24.1
FROM wener/base:${ALPINE_RELEASE}

ARG VERSION=5.0.5

RUN set -eux; \
    apk add --no-cache \
      bind-tools \
      pdns \
      pdns-backend-bind \
      pdns-backend-geoip \
      pdns-backend-ldap \
      pdns-backend-mysql \
      pdns-backend-pipe \
      pdns-backend-pgsql \
      pdns-backend-remote \
      pdns-backend-sqlite3 \
      pdns-recursor \
      pdns-tools; \
    pdns_server --version 2>&1 | grep -F "PowerDNS Authoritative Server ${VERSION}"; \
    pdns_recursor --version 2>&1 | head -1; \
    dig -v

EXPOSE 53 53/udp 80 5380

ENTRYPOINT []
CMD ["pdns_server", "--daemon=no", "--guardian=no", "--loglevel=9"]
