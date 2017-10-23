FROM wener/base
MAINTAINER  wener<wener@wener.me>

RUN apk add --no-cache privoxy

COPY entrypoint.sh /
RUN chmod +x /entrypoint.sh
EXPOSE 8888 7777

ENTRYPOINT ["/entrypoint.sh"]
