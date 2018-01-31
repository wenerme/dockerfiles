#!/usr/bin/env bash
docker run -d -it --name php-builder wener/php:builder
# Build redis
# Download from pear may need proxy
docker exec -i php-builder pecl install -o -f redis <<<no
docker exec -i php-builder pecl install -o -f mongodb
docker exec -i php-builder pecl install -o -f grpc
docker exec -i php-builder pecl install -o -f protobuf
docker exec -i php-builder pecl install -o -f apcu <<<no

# libyaml
docker exec -i php-builder pecl install -o -f yaml
# Imagemagick
docker exec -i php-builder pecl install -o -f imagick

# /usr/include/php7/ext/igbinary/php_igbinary.h
# https://github.com/igbinary/igbinary/
docker exec -i php-builder mkdir -p /usr/include/php7/


# Build with module
mkdir modules
MODULE="mongodb redis grpc protobuf apcu"
for i in $MODULE; do docker cp php-builder:/usr/lib/php7/modules/$i.so modules/; done;
rm modules/extra.ini
for i in $MODULE; do echo "extension=$i.so" >> modules/extra.ini; done;

# Build image
BUILD_SKIP_PUSH=1 ./build.sh appValidate
#
docker run --rm -it --entrypoint php wener/php:app -m | grep grpc

# Cleanup
docker stop php-builder
# No need to remove if will build other module later
docker rm -f php-builder

