#!/bin/sh
set -e
# set -o xtrace
# chown -R nobody:nobody ${WWW_ROOT:-/var/www/html}
# [ -z "$WWW_ROOT" ] || sed -i -e "s#/var/www/html#$WWW_ROOT#g" /etc/nginx/nginx.conf

php-fpm81 -t && nginx -t

php-fpm81
nginx

tail -F /var/log/nginx/access.log
