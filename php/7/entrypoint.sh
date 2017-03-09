#!/bin/sh
set -e
set -o xtrace
chown -R nobody:nobody /var/www/html
php-fpm7 -t && nginx -t

php-fpm7
nginx -g 'daemon off;'
