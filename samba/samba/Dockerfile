FROM        wener/base
MAINTAINER  wener<wener@wener.me>

RUN apk --no-cache add samba

COPY entrypoint.sh /
RUN chmod +x /entrypoint.sh

EXPOSE 139 445 137/udp 138/udp

ENTRYPOINT ["/entrypoint.sh"]
