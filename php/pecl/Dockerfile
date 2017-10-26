FROM        wener/php
MAINTAINER  wener<wener@wener.me>

RUN apk --no-cache add \
    # Base package exclude cgi,litespeed,apache2,doc
    php7-{dev,pear,phpdbg}

# https://github.com/docker-library/php/issues/443
RUN pecl update-channels && \
    rm -rf /tmp/pear ~/.pearrc
