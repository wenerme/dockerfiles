FROM wener/base
MAINTAINER wener<wenermail@gmail.com>

RUN apk add --no-cache pdns pdns-recursor pdns-backend-mysql pdns-backend-sqlite3 pdns-backend-pgsql
# We need nsupdate, dig
RUN apk add --no-cache bind-tools

# Expected pdns.conf in /etc/pdns
VOLUME /etc/pdns
WORKDIR /etc/pdns
EXPOSE 53 53/udp 80 8080

CMD [ "pdns_server", "--daemon=no" ]
