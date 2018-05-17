FROM wener/base:bash

RUN apk add --no-cache \
            pdns pdns-recursor \
            pdns-backend-{geoip,mysql,sqlite3,pgsql,pipe,bind,ldap} \
            bind-tools drill

COPY entrypoint.sh /
RUN chmod +x /entrypoint.sh

WORKDIR /etc/pdns
EXPOSE 53 53/udp 80 8080

ENTRYPOINT ["/entrypoint.sh"]
