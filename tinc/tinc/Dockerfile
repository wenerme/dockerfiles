FROM wener/base

RUN apk add --no-cache tinc-pre

COPY entrypoint.sh /
RUN chmod +x /entrypoint.sh

VOLUME /etc/tinc
EXPOSE 655 655/udp
ENTRYPOINT ["/entrypoint.sh"]
