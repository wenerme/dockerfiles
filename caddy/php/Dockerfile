FROM wener/caddy:full
LABEL org.label-schema.name="caddy:php" \
    org.label-schema.description="Caddy with php-fpm"

RUN apk add --no-cache php7-fpm

# allow environment variable access.
RUN echo "clear_env = no" >> /etc/php7/php-fpm.conf

COPY Caddyfile /etc/Caddyfile
COPY index.php /srv/index.php
