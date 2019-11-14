FROM wener/base:bash

RUN apk add --no-cache \
            pdns pdns-recursor \
            pdns-tools \
            pdns-backend-{remote,sqlite3,bind,geoip,ldap,lua,mydns,mysql,odbc,pgsql,pipe,random} \
            bind-tools drill

COPY entrypoint.sh /
RUN chmod +x /entrypoint.sh

WORKDIR /etc/pdns
EXPOSE 53 53/udp 80 8080

ENTRYPOINT ["/entrypoint.sh"]

