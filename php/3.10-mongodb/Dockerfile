FROM wener/base:3.10 as builder

RUN apk --no-cache add alpine-sdk autoconf libressl-dev zlib-dev php7-dev
RUN apk --no-cache add php7-pear php7-openssl
RUN pecl install -o -f mongodb

FROM wener/base:3.10

RUN apk --no-cache add php7

COPY --from=builder /usr/lib/php7/modules/mongodb.so /usr/lib/php7/modules
RUN echo extension=mongodb.so > /etc/php7/conf.d/mongodb.ini
