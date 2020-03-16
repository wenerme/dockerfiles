FROM wener/base:app

# add repo.wener.me to install newer version
RUN (cd /etc/apk/keys; curl -LO https://repo.wener.me/alpine/wenermail@gmail.com-5dc8c7cd.rsa.pub ) && \
    echo https://repo.wener.me/alpine/v$ALPINE_VERSION/community >> /etc/apk/repositories

RUN apk add --no-cache privoxy dante dante-server \
    # setup privoxy
    && cp /etc/privoxy/config /etc/privoxy/config.sample \
    && rc-update add privoxy \
    # setup dante
    && cp /etc/sockd.conf /etc/sockd.sample.conf \
    && rc-update add sockd

COPY privoxy.conf /etc/privoxy/config
COPY sockd.conf /etc
