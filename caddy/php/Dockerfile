FROM wener/caddy:full
MAINTAINER wener <wener@wener.me>

# essential php libs
RUN apk add --no-cache php7-fpm php7-curl php7-dom php7-gd php7-ctype php7-zip php7-xml php7-iconv php7-sqlite3 php7-mysqli php7-pgsql php7-json php7-phar php7-openssl php7-pdo

# composer
RUN curl --silent --show-error --fail --location \
      --header "Accept: application/tar+gzip, application/x-gzip, application/octet-stream" \
      "https://getcomposer.org/installer" \
    | php7 -- --install-dir=/usr/bin --filename=composer

# allow environment variable access.
RUN echo "clear_env = no" >> /etc/php7/php-fpm.conf

EXPOSE 80 443 2015
WORKDIR /srv

COPY php/Caddyfile /etc/Caddyfile
COPY php/index.php /srv/index.php

ENTRYPOINT ["/usr/bin/caddy"]
CMD ["--conf", "/etc/Caddyfile", "--log", "stdout"]
