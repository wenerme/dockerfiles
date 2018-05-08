#!/bin/sh
set -e

if [ $# = 0 ] ; then
    set -o xtrace
    chown -R nobody:nobody ${WWW_ROOT:-/var/www/html}
    [ -z "$WWW_ROOT" ] || sed -i -e "s#/var/www/html#$WWW_ROOT#g" /etc/nginx/nginx.conf

    php5-fpm -t && nginx -t

    php5-fpm
    nginx -g 'daemon off;'
else
  "$@"
fi
