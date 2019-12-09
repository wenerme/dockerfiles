FROM wener/base

# add repo.wener.me to install newer go version
RUN (cd /etc/apk/keys; curl -LO https://repo.wener.me/alpine/wenermail@gmail.com-5dc8c7cd.rsa.pub ) && \
    echo https://repo.wener.me/alpine/v$ALPINE_VERSION/community >> /etc/apk/repositories

RUN apk add --no-cache tinc-pre

VOLUME /etc/tinc
EXPOSE 655 655/udp
ENTRYPOINT []
