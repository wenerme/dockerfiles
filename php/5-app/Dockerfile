FROM        wener/php:5-builder as builder
MAINTAINER  wener<wener@wener.me>


RUN pecl install -o -f igbinary     && \
    apk add --no-cache xz-dev && echo -e "yes\nyes" | pecl install -o -f redis  && \
    pecl install -o -f mongodb      && \
    pecl install -o -f grpc         && \
    pecl install -o -f protobuf

ENV MODULES="igbinary redis mongodb grpc protobuf"

RUN mkdir /modules; \
    for i in $MODULES; do echo Add module $i; cp /usr/lib/php5/modules/$i.so /modules; done; \
    for i in $MODULES; do echo "extension=$i.so" >> /extra.ini; done;

FROM        wener/php:5
MAINTAINER  wener<wener@wener.me>

COPY --from=builder /modules /usr/lib/php5/modules
COPY --from=builder /extra.ini /etc/php5/conf.d
