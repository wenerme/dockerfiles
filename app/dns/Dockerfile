FROM wener/app


# add repo.wener.me to install newer version
# RUN (cd /etc/apk/keys;curl -sLO https://repo.wener.me/alpine/wenermail@gmail.com-5dc8c7cd.rsa.pub ) && \
#     echo https://repo.wener.me/alpine/v$ALPINE_VERSION/community >> /etc/apk/repositories

RUN apk add --no-cache \
    # server
    # - no mysql backend need extra 30MB space
    pdns pdns-tools pdns-backend-{remote,geoip,sqlite3,pgsql,pipe,bind,ldap} \
    # recursor
    pdns-recursor \
    # cache
    dnsmasq-dnssec \
    # utils
    bind-tools

EXPOSE 53 53/udp 80 5380
