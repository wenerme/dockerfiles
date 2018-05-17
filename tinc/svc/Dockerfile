FROM wener/base:svc

RUN apk add --no-cache tinc-pre && rc-update add tincd

WORKDIR /etc/tinc
EXPOSE 655 655/udp
