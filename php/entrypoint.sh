#!/bin/sh
set -e
set -o xtrace
chown -R nobody:nobody /var/www/html
php-fpm -t && nginx -t

php-fpm
nginx -g 'daemon off;'
