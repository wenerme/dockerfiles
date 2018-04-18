FROM wener/base:bash
MAINTAINER wener<wenermail@gmail.com>

RUN echo '@edge http://mirrors.aliyun.com/alpine/edge/main/' >> /etc/apk/repositories; \
    echo '@edge http://mirrors.aliyun.com/alpine/edge/community/' >> /etc/apk/repositories

RUN apk add --no-cache \
            pdns pdns-recursor@edge \
            pdns-tools@edge \
            pdns-backend-{remote,sqlite3,bind,geoip,ldap,lua,mydns,mysql,odbc,pgsql,pipe,random}@edge \
            bind-tools drill

COPY entrypoint.sh /
RUN chmod +x /entrypoint.sh

WORKDIR /etc/pdns
EXPOSE 53 53/udp 80 8080

ENTRYPOINT ["/entrypoint.sh"]

