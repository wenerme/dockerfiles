#!/bin/sh
set -e

if [ $# = 0 ] ; then
    set -o xtrace
    chown -R nobody:nobody ${WWW_ROOT:-/var/www/html}
    [ -z "$WWW_ROOT" ] || sed -i -e "s#/var/www/html#$WWW_ROOT#g" /etc/nginx/nginx.conf

    php-fpm5 -t && nginx -t

    php-fpm5
    nginx -g 'daemon off;'
else
  "$@"
fi
