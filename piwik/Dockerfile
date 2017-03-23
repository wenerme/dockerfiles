FROM wener/php:5
MAINTAINER  wener<wener@wener.me>

#COPY piwik.zip /
RUN \
    curl -sSo /piwik.zip https://builds.piwik.org/piwik.zip && \
    unzip /piwik.zip -qd /var/www
RUN sed -i -e 's#;always_populate_raw_post_data#always_populate_raw_post_data#' /etc/php5/php.ini

ENV WWW_ROOT /var/www/piwik

RUN php-fpm -t && nginx -t
