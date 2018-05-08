FROM        wener/php:5-builder as builder
MAINTAINER  wener<wener@wener.me>

RUN pecl install -o -f redis <<<no

FROM        wener/php:5
MAINTAINER  wener<wener@wener.me>

COPY --from=builder /usr/lib/php5/modules/redis.so /usr/lib/php5/modules/
RUN for i in "redis"; do echo "extension=$i.so" >> /etc/php5/conf.d/extra.ini; done;
