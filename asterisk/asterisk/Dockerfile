FROM wener/base:bash

# add repo.wener.me to install newer version
RUN (cd /etc/apk/keys; curl -LO https://repo.wener.me/alpine/wenermail@gmail.com-5dc8c7cd.rsa.pub ) && \
    echo https://repo.wener.me/alpine/v$ALPINE_VERSION/community >> /etc/apk/repositories

RUN apk add --no-cache asterisk openssl && \
    apk add --no-cache asterisk-{curl,dahdi,pgsql,sample-config,sounds-en,sounds-moh,srtp}

# HTTP HTTPS AMI
EXPOSE 8088 8089 5038
# SIP signaling RTP audio
EXPOSE 5060-5070/udp 8766-35000/udp
# IAX2
EXPOSE 4568 4568/udp
