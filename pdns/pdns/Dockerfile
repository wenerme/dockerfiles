FROM wener/base

RUN apk add --no-cache \
    pdns pdns-tools pdns-backend-{remote,geoip,sqlite3,pgsql,pipe,bind,ldap,mysql} \
    # recursor
    pdns-recursor \
    # utils
    bind-tools

EXPOSE 53 53/udp 80 5380

# /usr/sbin/pdns_recursor
ENTRYPOINT []
