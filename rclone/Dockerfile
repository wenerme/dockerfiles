FROM wener/base:bash

# add repo.wener.me to install newer version
RUN (cd /etc/apk/keys; curl -LO https://repo.wener.me/alpine/wenermail@gmail.com-5dc8c7cd.rsa.pub ) && \
    echo https://repo.wener.me/alpine/v$ALPINE_VERSION/community >> /etc/apk/repositories

RUN apk add --no-cache rclone
