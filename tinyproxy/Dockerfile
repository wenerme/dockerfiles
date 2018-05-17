FROM wener/base

RUN apk add --no-cache tinyproxy

COPY entrypoint.sh /
RUN chmod +x /entrypoint.sh
EXPOSE 8888 7777

ENTRYPOINT ["/entrypoint.sh"]
