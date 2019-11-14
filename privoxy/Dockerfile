FROM wener/base

RUN apk add --no-cache privoxy

RUN cp /etc/privoxy/config /etc/privoxy/config.sample
COPY privoxy.conf /etc/privoxy/config
COPY entrypoint.sh /
RUN chmod +x /entrypoint.sh
EXPOSE 7777

ENTRYPOINT ["/entrypoint.sh"]
