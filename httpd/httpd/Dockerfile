FROM wener/base
RUN apk add --no-cache \
      apache2 \
      apache2-ctl \
      apache2-utils \
      apache2-brotli \
      apache2-http2 \
      apache2-lua \
      apache2-mod-wsgi \
      apache2-proxy \
      apache2-proxy-html \
      apache2-ssl \
      apache2-webdav

COPY rootfs /

ENTRYPOINT ["/httpd-foreground"]
